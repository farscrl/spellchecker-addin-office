import { Component, OnInit } from '@angular/core';
import { SpellcheckerService } from '../services/spellchecker.service';
import { UserDictionaryService } from '../services/user-dictionary.service';

@Component({
  selector: 'app-spellchecker-inline',
  templateUrl: './spellchecker-inline.component.html',
  styleUrl: './spellchecker-inline.component.scss'
})
export class SpellcheckerInlineComponent implements OnInit {

  isSpellchecking = false;

  constructor(
      private spellcheckerService: SpellcheckerService,
      private userDictionaryService: UserDictionaryService,
  ) {}

  ngOnInit() {
    this.initChangeHandlers().then(async () => {
      await this.executeFullCheck();
    })
  }

  async executeFullCheck() {
    this.isSpellchecking = true;

    return Word.run(async (context) => {
      OfficeExtension.config.extendedErrorLogging = true;
      const body = context.document.body;
      try {
        context.load(body.paragraphs);
        await context.sync();

        const paragraphCollection = body.paragraphs.load({
          text: true,
          uniqueLocalId: true,
        });
        for (const paragraph of paragraphCollection.items) {
          const paragraphText = paragraph.text;
          await this.spellcheckParagraph(context, paragraphText, paragraph.uniqueLocalId);
          console.log(`${paragraph.uniqueLocalId} - ${paragraph.text}`);
        }
      } catch (e) {
        // @ts-ignore
        console.error(e.message, e.debugInfo);
      } finally {
        this.isSpellchecking = false;
      }
    });
  }

  private async initChangeHandlers(): Promise<void> {
    const that = this;
    await Word.run(async (context) => {
      context.document.onParagraphAdded.add(this.paragraphAdded.bind(that));
      context.document.onParagraphChanged.add(this.paragraphChanged.bind(that));
      context.document.onParagraphDeleted.add(this.paragraphDeleted.bind(that));
      await context.sync();

      console.log("Added event handler for paragraph changes");
    });
  }

  private async paragraphAdded(event: Word.ParagraphAddedEventArgs) {
    await Word.run(async (context) => {
      await context.sync();
      console.log(event);

      for (let id of event.uniqueLocalIds) {
        let paragraph = context.document.getParagraphByUniqueLocalId(id);
        paragraph.load();
        await paragraph.context.sync();

        console.log(`${event.type} - ${paragraph.uniqueLocalId} - ${paragraph.text}`);
        await this.spellcheckParagraph(context, paragraph.text, paragraph.uniqueLocalId);
      }
    });
  }

  private async paragraphChanged(event: Word.ParagraphChangedEventArgs) {
    await Word.run(async (context) => {
      for (let id of event.uniqueLocalIds) {
        let paragraph = context.document.getParagraphByUniqueLocalId(id);
        paragraph.load();
        await paragraph.context.sync();
        paragraph.parentBody.load();
        await paragraph.parentBody.context.sync();

        console.log(`${event.type} - ${paragraph.uniqueLocalId} - ${paragraph.text}- ${paragraph.parentBody.type}`);
        await this.spellcheckParagraph(context, paragraph.text, paragraph.uniqueLocalId);
      }
    });
  }

  private async paragraphDeleted(event: Word.ParagraphDeletedEventArgs) {
    await Word.run(async (context) => {
      for (let id of event.uniqueLocalIds) {
        console.log(`${event.type} - ${id}`);
      }
    });
  }

  private async spellcheckParagraph(context: Word.RequestContext, paragraphText: string, paragraphId: string) {
    await this.deleteExistingAnnotations(context, paragraphId);
    const errs = await this.spellcheckerService.proofreadText(paragraphText);
    const critiques: Word.Critique[] = [];
    for await (const e of errs) {
      if (this.userDictionaryService.isInDictionary(e.word)) {
        continue;
      }

      const suggestions = await this.spellcheckerService.getSuggestions(e.word);
      const titleResourceId = suggestions.length > 0 ? "Spellchecker.Popup.Title" : "Spellchecker.Popup.Title.No";
      const subtitleResourceId = suggestions.length > 0 ? "Spellchecker.Popup.Subtitle" : "Spellchecker.Popup.Subtitle.No";
      critiques.push({
        colorScheme: Word.CritiqueColorScheme.berry,
        start: e.offset,
        length: e.length,
        popupOptions: {
          brandingTextResourceId: "Spellchecker.Popup.Branding",
          subtitleResourceId: subtitleResourceId,
          titleResourceId: titleResourceId,
          suggestions: suggestions
        }
      })
    }
    if (critiques.length > 0) {
      const annotationSet: Word.AnnotationSet = {
        critiques: critiques
      };
      const paragraph = context.document.getParagraphByUniqueLocalId(paragraphId)
      paragraph.load();
      await paragraph.context.sync();
      const annotationIds = paragraph.insertAnnotations(annotationSet);
      console.log(annotationIds)
      await context.sync();
      console.log('inserted annotations', annotationSet)
    }
  }

  async deleteExistingAnnotations(context: Word.RequestContext, paragraphId: string) {
    const paragraph = context.document.getParagraphByUniqueLocalId(paragraphId)
    const annotations: Word.AnnotationCollection = paragraph.getAnnotations();
    annotations.load("id");

    await context.sync();

    for (let i = 0; i < annotations.items.length; i++) {
      const annotation: Word.Annotation = annotations.items[i];
      annotation.delete();
    }

    await context.sync();
  }
}
