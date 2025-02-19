import { Injectable } from "@angular/core";
import { SpellcheckerService } from "./spellchecker.service";
import { UserDictionaryService } from "./user-dictionary.service";

/**
 * This service provides functions, that have to be run in a `Word.run(...)` context. Thus,
 * the context parameter is always required, even if not used, just to ensure, that this
 * requirement is not forgotten.
 */
@Injectable({
  providedIn: "root",
})
export class WordApiService {
  constructor(
    private spellcheckerService: SpellcheckerService,
    private userDictionaryService: UserDictionaryService
  ) {}

  async executeFullCheck(context: Word.RequestContext) {
    OfficeExtension.config.extendedErrorLogging = true;
    const body = context.document.body;
    try {
      context.load(body.paragraphs);
      await context.sync();

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
    }
  }

  async spellcheckParagraph(
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

  private async deleteAllAnnotations(
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
}
