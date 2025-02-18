import { Component, OnDestroy, OnInit } from "@angular/core";
import { SpellcheckerService } from "../services/spellchecker.service";
import { UserDictionaryService } from "../services/user-dictionary.service";
import { SuggestionBoxComponent } from "./suggestion-box/suggestion-box.component";
import { MatomoTracker } from "ngx-matomo-client";
import { Subscription } from "rxjs";
import { Language } from "../data/language";
import { SettingsService } from "../services/settings.service";
import { SpinnerComponent } from "./spinner/spinner.component";
import LanguageUtils from "../utils/language.utils";
import AnnotationPopupActionEventArgs = Word.AnnotationPopupActionEventArgs;

@Component({
  selector: "app-spellchecker-inline",
  templateUrl: "./spellchecker-inline.component.html",
  styleUrl: "./spellchecker-inline.component.scss",
  imports: [SuggestionBoxComponent, SpinnerComponent],
})
export class SpellcheckerInlineComponent implements OnInit, OnDestroy {
  isSpellcheckingInitial = false;
  isSpellchecking = false;

  private languageSubscription?: Subscription;
  language: Language = "rumantschgrischun";

  private start: number = 0;

  constructor(
    private settingsService: SettingsService,
    private spellcheckerService: SpellcheckerService,
    private userDictionaryService: UserDictionaryService,
    private matomoTracker: MatomoTracker
  ) {}

  ngOnInit() {
    this.languageSubscription = this.settingsService
      .getLanguageObservable()
      .subscribe((lng) => {
        this.language = lng;
      });
    this.initChangeHandlers().then(async () => {
      await this.executeFullCheck();
    });
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  async executeFullCheck() {
    this.isSpellcheckingInitial = true;

    return Word.run(async (context) => {
      this.start = performance.now();
      OfficeExtension.config.extendedErrorLogging = true;
      const body = context.document.body;
      try {
        context.load(body.paragraphs);
        await context.sync();

        this.start = performance.now();
        const paragraphCollection = body.paragraphs.load({
          uniqueLocalId: true,
          text: true,
        });
        await context.sync();

        await this.deleteAllAnnotations(context, paragraphCollection);
        for (const paragraph of paragraphCollection.items) {
          await this.spellcheckParagraph(context, paragraph);
        }
        await context.sync();
      } catch (e) {
        // @ts-ignore
        console.error(e.message, e.debugInfo);
      } finally {
        this.isSpellcheckingInitial = false;
        const end = performance.now();
        this.matomoTracker.trackEvent(
          "Actions",
          "Full check",
          this.language,
          Math.round(end - this.start)
        );
      }
    });
  }

  private async initChangeHandlers(): Promise<void> {
    const that = this;
    await Word.run(async (context) => {
      context.document.onParagraphAdded.add(this.paragraphAdded.bind(that));
      context.document.onParagraphChanged.add(this.paragraphChanged.bind(that));
      context.document.onParagraphDeleted.add(this.paragraphDeleted.bind(that));
      context.document.onAnnotationPopupAction.add(
        this.onPopupActionHandler.bind(that)
      );
      await context.sync();
    });
  }

  private async paragraphAdded(event: Word.ParagraphAddedEventArgs) {
    this.isSpellchecking = true;
    await Word.run(async (context) => {
      await context.sync();
      for (let id of event.uniqueLocalIds) {
        const paragraph = context.document.getParagraphByUniqueLocalId(id);
        paragraph.load("text");
        await context.sync();
        await this.spellcheckParagraph(context, paragraph);
        await context.sync();
      }
      this.isSpellchecking = false;
    });
  }

  private async paragraphChanged(event: Word.ParagraphChangedEventArgs) {
    this.isSpellchecking = true;
    await Word.run(async (context) => {
      for (let id of event.uniqueLocalIds) {
        const paragraph = context.document.getParagraphByUniqueLocalId(id);
        paragraph.load("text");
        await context.sync();
        await this.spellcheckParagraph(context, paragraph);
        await context.sync();
      }
      this.isSpellchecking = false;
    });
  }

  private async paragraphDeleted(event: Word.ParagraphDeletedEventArgs) {
    await Word.run(async (context) => {
      for (let id of event.uniqueLocalIds) {
      }
    });
  }

  private async onPopupActionHandler(args: AnnotationPopupActionEventArgs) {
    console.log("popup", args);

    if (args.action === "Reject") {
      await Word.run(async (context) => {
        const annotation = context.document.getAnnotationById(args.id);
        annotation.load("critiqueAnnotation");
        await context.sync();

        const range: Word.Range = annotation.critiqueAnnotation.range;
        range.load("text");
        await context.sync();

        this.userDictionaryService.addToDictionary(range.text);
      });
    }
  }

  private async spellcheckParagraph(
    context: Word.RequestContext,
    paragraph: Word.Paragraph
  ) {
    // this.start = performance.now();
    const errs = await this.spellcheckerService.proofreadText(paragraph.text);
    const critiques: Word.Critique[] = [];
    for await (const e of errs) {
      if (this.userDictionaryService.isInDictionary(e.word)) {
        continue;
      }

      const suggestions = await this.spellcheckerService.getSuggestions(e.word);

      critiques.push(this.createCritique(suggestions, e.offset, e.length));
    }
    if (critiques.length > 0) {
      const annotationSet: Word.AnnotationSet = {
        critiques: critiques,
      };
      paragraph.insertAnnotations(annotationSet);
    }
  }

  async deleteAllAnnotations(
    context: Word.RequestContext,
    paragraphs: Word.ParagraphCollection
  ) {
    const allAnnotations: Word.AnnotationCollection[] = [];
    for (const paragraph of paragraphs.items) {
      const annotations: Word.AnnotationCollection = paragraph.getAnnotations();
      annotations.load("id");
      allAnnotations.push(annotations);
    }

    await context.sync();

    allAnnotations.forEach((annotations) => {
      for (let i = 0; i < annotations.items.length; i++) {
        const annotation: Word.Annotation = annotations.items[i];
        annotation.delete();
      }
    });

    await context.sync();
  }

  private createCritique(
    suggestions: string[],
    start: number,
    length: number
  ): Word.Critique {
    return {
      colorScheme: Word.CritiqueColorScheme.berry,
      start: start,
      length: length,
      popupOptions: this.createPopupOptions(suggestions),
    };
  }

  private createPopupOptions(suggestions: string[]): Word.CritiquePopupOptions {
    const titleResourceId =
      suggestions.length > 0
        ? "Spellchecker.Popup.Title"
        : "Spellchecker.Popup.Title.No";
    const subtitleResourceId =
      suggestions.length > 0
        ? "Spellchecker.Popup.Subtitle"
        : "Spellchecker.Popup.Subtitle.No";

    return {
      brandingTextResourceId: "Spellchecker.Popup.Branding",
      subtitleResourceId: subtitleResourceId,
      titleResourceId: titleResourceId,
      suggestions: suggestions,
    };
  }

  protected readonly LanguageUtils = LanguageUtils;
}
