import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SpellcheckerService } from "../services/spellchecker.service";
import WordUtils from "../utils/word.utils";
import { ISpellingError } from "../data/data-structures";
import { UserDictionaryService } from "../services/user-dictionary.service";
import { DialogRef, DialogService } from "@ngneat/dialog";
import {SettingsService} from "../services/settings.service";
import {Subscription} from "rxjs";
import {Language} from "../data/language";

/* global Word */

@Component({
  selector: 'app-spellchecker',
  templateUrl: './spellchecker.component.html',
  styleUrls: ['./spellchecker.component.scss']
})
export class SpellcheckerComponent implements OnInit, OnDestroy {

  isSpellchecking = false;

  isFirstRun = true;

  paragraphs: string[] = [];

  spellingErrors: ISpellingError[] = [];

  lastCorrectedError?: { errorIndex: number, paragraphIndex: number, paragraphText: string, errorText: string};

  @ViewChild('errorDialog') errorDialog?: TemplateRef<any>;

  errorIntro = "";
  errorMessage = "";
  dialogRef?: DialogRef;

  private languageSubscription?: Subscription;
  language: Language = 'rumantschgrischun';

  constructor(
      private spellcheckerService: SpellcheckerService,
      private userDictionaryService: UserDictionaryService,
      private dialogService: DialogService,
      private settingsService: SettingsService,
  ) {
  }

  ngOnInit() {
    this.languageSubscription = this.settingsService.getLanguageObservable().subscribe(lng => {
      this.language = lng;
    });
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  get languageText() {
    switch (this.language) {
      case 'puter':
        return ' (puter)';
      case 'rumantschgrischun':
        return ' (RG)';
      case 'sursilvan':
        return ' (sursilvan)';
      case 'sutsilvan':
        return ' (sutsilvan)';
      case 'surmiran':
        return ' (surmiran)';
      case 'vallader':
        return ' (vallader)';
    }
    return '';
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
            if (this.userDictionaryService.isInDictionary(e.word)) {
              return;
            }
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
        this.handleError(e);
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

        const newParagraph = paragraphRange.paragraphs.getFirst();
        newParagraph.load('text');
        await context.sync();

        this.updateLineText(obj.paragraphIndex, newParagraph.text);

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
        this.handleError(e);
      }
    });
  }

  ignoreWord(obj: {paragraphIndex: number, errorIndex: number, word: string }) {
    this.userDictionaryService.addToDictionary(obj.word);
    this.removeGrammarError(obj.errorIndex);
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

  private handleError(e: any) {

    if (e instanceof Error) {
      if (e.message.startsWith("Could not find range for chunk: ")) {
        this.errorIntro = "Betg chattà il paragraf";
        this.errorMessage = e.message.replace("Could not find range for chunk: ", "");
      } else if(e.message.startsWith("The range for the error was not found: ")) {
        this.errorIntro = "Betg chattà il pled";
        this.errorMessage = e.message.replace("The range for the error was not found: ", "");
      } else {
        this.errorIntro = "Errur nunenconuschenta"
        this.errorMessage = e.message;
      }

      this.dialogRef = this.dialogService.open(this.errorDialog!);
      this.dialogRef.afterClosed$.subscribe((result) => {
        if (!!result) {
          this.checkGrammar();
        }
      });
      console.error(e.message);
    } else {
      console.error(e);
    }
  }
}
