import { Component, OnInit } from '@angular/core';
import SpellcheckerUtil, { ITextWithPosition } from "../utils/spellchecker.util";
import { SpellcheckerService } from "../services/spellchecker.service";
import WordUtils from "../utils/word.utils";
import { debounceTime, Subject } from "rxjs";

/* global Word */

export interface ICorrectedParagraph {
  text: string;
  errors: ITextWithPosition[];
}

@Component({
  selector: 'app-spellchecker',
  templateUrl: './spellchecker.component.html',
  styleUrls: ['./spellchecker.component.scss']
})
export class SpellcheckerComponent implements OnInit {

  spellcheckerUtil?: SpellcheckerUtil;

  isSpellchecking = false;

  correctedParagraphs: ICorrectedParagraph[] = [];

  private highlightSubject = new Subject<{paragraphIndex: number, errorIndex: number, activate: boolean}>();
  highlightSource = this.highlightSubject.pipe(debounceTime(150));

  constructor(private spellcheckerService: SpellcheckerService) {
    this.highlightSource.subscribe(obj => {
     this.highlightDirectly(obj);
    });
  }

  ngOnInit() {
    this.spellcheckerUtil = new SpellcheckerUtil();
  }

  async checkGrammar(): Promise<void> {
    return Word.run(async (context) => {
      const body = context.document.body;
      try {
        context.load(body.paragraphs);
        await context.sync();
        const paragraphCollection = body.paragraphs.load({
          text: true,
        });
        const paragraphs = paragraphCollection.items.map((p) => p.text);

        let paragraphIndex = 0;
        let textEndIndex = paragraphs.length;

        this.correctedParagraphs = [];
        for (; paragraphIndex < textEndIndex; paragraphIndex++) {
          const paragraph = paragraphs[paragraphIndex];
          const correctedParagraph: ICorrectedParagraph = {
            text: paragraph,
            errors: await this.spellcheckerService.proofreadText(paragraph)
          };
          this.correctedParagraphs[paragraphIndex] = correctedParagraph;
        }

      } catch (e) {
        // @ts-ignore
        console.error(e.message, e.debugInfo);
      } finally {
        this.isSpellchecking = false;
      }
    });
  }

  highlight(obj: {paragraphIndex: number, errorIndex: number, activate: boolean}) {
    this.highlightSubject.next(obj);
  }

  highlightDirectly(obj: {paragraphIndex: number, errorIndex: number, activate: boolean}) {
    Word.run(async (context) => {
      try {
        const errorText = this.getGrammarErrorText(obj.paragraphIndex, obj.errorIndex);
        const paragraphText = this.getLineText(obj.paragraphIndex);
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
        const errorText = this.getGrammarErrorText(obj.paragraphIndex, obj.errorIndex);
        const paragraphText = this.getLineText(obj.paragraphIndex);
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

        this.removeGrammarError(obj.paragraphIndex, obj.errorIndex);

        await context.sync();
      } catch (e) {
        // @ts-ignore
        console.error(e.message, e.debugInfo);
      }
    });
  }

  private getLineText(lineIndex: number): string {
    return this.correctedParagraphs[lineIndex].text;
  }

  private getGrammarErrorText(lineIndex: number, errorIndex: number): string {
    return this.correctedParagraphs[lineIndex].errors[errorIndex].word;
  }

  private removeGrammarError(lineIndex: number, errorIndex: number) {
    this.correctedParagraphs[lineIndex].errors.splice(errorIndex, 1);
  }

  insertGrammarError(lineIndex: number, errorIndex: number, error: ITextWithPosition) {
    this.correctedParagraphs[lineIndex].errors.splice(errorIndex, 0, error);
  }
}
