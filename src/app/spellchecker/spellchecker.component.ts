import { Component } from '@angular/core';
import { SpellcheckerService } from "../services/spellchecker.service";
import WordUtils from "../utils/word.utils";
import { debounceTime, Subject } from "rxjs";
import { ISpellingError } from "../data/spelling-error";

/* global Word */

@Component({
  selector: 'app-spellchecker',
  templateUrl: './spellchecker.component.html',
  styleUrls: ['./spellchecker.component.scss']
})
export class SpellcheckerComponent {

  isSpellchecking = false;

  paragraphs: string[] = [];

  spellingErrors: ISpellingError[] = [];

  private highlightSubject = new Subject<{paragraphIndex: number, errorIndex: number, activate: boolean}>();
  highlightSource = this.highlightSubject.pipe(debounceTime(150));

  constructor(private spellcheckerService: SpellcheckerService) {
    this.highlightSource.subscribe(obj => {
     this.highlightDirectly(obj);
    });
  }

  async checkGrammar(): Promise<void> {
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
            })
          });
        }
      } catch (e) {
        // @ts-ignore
        console.error(e.message, e.debugInfo);
      } finally {
        this.isSpellchecking = false;
        console.log(this.spellingErrors)
      }
    });
  }

  highlight(obj: {paragraphIndex: number, errorIndex: number, activate: boolean}) {
    this.highlightSubject.next(obj);
  }

  highlightDirectly(obj: {paragraphIndex: number, errorIndex: number, activate: boolean}) {
    Word.run(async (context) => {
      try {
        const paragraphText = this.getLineText(obj.paragraphIndex);
        const errorText = this.getGrammarErrorText(obj.errorIndex);
        const errorRange = await WordUtils.getRange(context, paragraphText, errorText);

        errorRange.select(obj.activate ? 'Start' : 'Select');
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
        const errorRange = await WordUtils.getRange(context, paragraphText, errorText);

        errorRange.insertText(obj.suggestion, 'Replace');
        errorRange.select('End');

        /*const lastCorrectedError = {
          error: this.correctedParagraphs[obj.paragraphIndex].errors[obj.errorIndex],
          selectedSuggestion: obj.suggestion,
          paragraphIndex: obj.paragraphIndex,
          errorIndex: obj.errorIndex,
        };

        this.setState({
          lastCorrectedError,
        }, () => {
          setTimeout(this.clearLastCorrectedError, SNACKBAR_DISAPPEAR_AFTER_MS);
        });*/

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
