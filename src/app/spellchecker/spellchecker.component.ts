import { Component } from '@angular/core';
import { SpellcheckerService } from "../services/spellchecker.service";
import WordUtils from "../utils/word.utils";
import { ISpellingError } from "../data/data-structures";

/* global Word */

@Component({
  selector: 'app-spellchecker',
  templateUrl: './spellchecker.component.html',
  styleUrls: ['./spellchecker.component.scss']
})
export class SpellcheckerComponent {

  isSpellchecking = false;

  isFirstRun = true;

  paragraphs: string[] = [];

  spellingErrors: ISpellingError[] = [];

  lastCorrectedError?: { errorIndex: number, paragraphIndex: number, paragraphText: string, errorText: string};

  constructor(private spellcheckerService: SpellcheckerService) {
  }

  async checkGrammar(): Promise<void> {
    this.isFirstRun = false;
    this.isSpellchecking = true;

    return Word.run(async (context) => {
      const body = context.document.body;
      try {
        context.load(body.paragraphs);
        await context.sync();
        const paragraphCollection = body.paragraphs.load({
          text: true,
        });
        this.paragraphs = paragraphCollection.items.map((p) => p.text);

        this.spellingErrors = [];
        for (let paragraphIndex = 0; paragraphIndex < this.paragraphs.length; paragraphIndex++) {
          const paragraph = this.paragraphs[paragraphIndex];
          const errs = await this.spellcheckerService.proofreadText(paragraph);
          errs.forEach(e => {
            this.spellingErrors.push({
              paragraph: paragraphIndex,
              offset: e.offset,
              length: e.length,
              word: e.word,
            });
          });
        }
      } catch (e) {
        // @ts-ignore
        console.error(e.message, e.debugInfo);
      } finally {
        this.isSpellchecking = false;
      }
    });
  }

  async highlight(obj: {paragraphIndex: number, errorIndex: number }) {
    await Word.run(async (context) => {
      try {
        const paragraphText = this.getLineText(obj.paragraphIndex);
        const errorText = this.getGrammarErrorText(obj.errorIndex);
        const paragraphRange = await WordUtils.getParagraphRange(context, paragraphText);
        const errorRange = await WordUtils.getWordRange(context, paragraphRange, errorText);

        errorRange.select('Select');
        await context.sync();
      } catch (e) {
        // @ts-ignore
        console.error(e.message, e.debugInfo);
      }
    });
  }

  acceptSuggestion(obj: {paragraphIndex: number, errorIndex: number, suggestion: string }) {
    Word.run(async (context) => {
      try {
        const paragraphText = this.getLineText(obj.paragraphIndex);
        const errorText = this.getGrammarErrorText(obj.errorIndex);
        const paragraphRange = await WordUtils.getParagraphRange(context, paragraphText);
        const errorRange = await WordUtils.getWordRange(context, paragraphRange, errorText);

        errorRange.insertText(obj.suggestion, 'Replace');
        errorRange.select('End');

        paragraphRange.load('text');
        await context.sync();

        this.updateLineText(obj.paragraphIndex, paragraphRange.text);

        // TODO: show toast to revoke change
        this.lastCorrectedError = {
          errorIndex: obj.errorIndex,
          paragraphIndex: obj.paragraphIndex,
          paragraphText: paragraphText,
          errorText: errorText
        };

        this.removeGrammarError(obj.errorIndex);

        await context.sync();
      } catch (e) {
        // @ts-ignore
        console.error(e.message, e.debugInfo);
      }
    });
  }

  private getLineText(lineIndex: number): string {
    return this.paragraphs[lineIndex];
  }

  private updateLineText(lineIndex: number, newText: string): void {
    this.paragraphs[lineIndex] = newText;
  }

  private getGrammarErrorText(errorIndex: number): string {
    return this.spellingErrors[errorIndex].word;
  }

  private removeGrammarError(errorIndex: number) {
    this.spellingErrors.splice(errorIndex, 1);
  }

  insertGrammarError(errorIndex: number, error: ISpellingError) {
    this.spellingErrors.splice(errorIndex, 0, error);
  }
}
