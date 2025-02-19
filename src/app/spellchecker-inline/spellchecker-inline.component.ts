import { Component, OnDestroy, OnInit } from "@angular/core";
import { UserDictionaryService } from "../services/user-dictionary.service";
import { SuggestionBoxComponent } from "./suggestion-box/suggestion-box.component";
import { MatomoTracker } from "ngx-matomo-client";
import { Subscription } from "rxjs";
import { Language } from "../data/language";
import { SettingsService } from "../services/settings.service";
import { SpinnerComponent } from "./spinner/spinner.component";
import LanguageUtils from "../utils/language.utils";
import { WordApiService } from "../services/word-api.service";
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
    private userDictionaryService: UserDictionaryService,
    private matomoTracker: MatomoTracker,
    private wordApiService: WordApiService
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
    this.wordApiService.abortFullCheck();
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  async executeFullCheck() {
    this.isSpellcheckingInitial = true;
    this.start = performance.now();

    await Word.run(async (context) => {
      await this.wordApiService.executeFullCheck(context);
    });

    this.isSpellcheckingInitial = false;
    const end = performance.now();
    this.matomoTracker.trackEvent(
      "Actions",
      "Full check",
      this.language,
      Math.round(end - this.start)
    );
    console.log("Execution time", Math.round(end - this.start));
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
        await this.wordApiService.spellcheckParagraph(context, paragraph);
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
        await this.wordApiService.spellcheckParagraph(context, paragraph);
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

  protected readonly LanguageUtils = LanguageUtils;
}
