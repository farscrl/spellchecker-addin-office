import { Component } from '@angular/core';
import { SpellcheckerService } from "../services/spellchecker.service";
import { ISpellError } from "../data/data-structures";
import RangeCollection = Word.RangeCollection;

/* global Word */

@Component({
  selector: 'app-spellchecker',
  templateUrl: './spellchecker.component.html',
  styleUrls: ['./spellchecker.component.scss']
})
export class SpellcheckerComponent {

  spellingErrors: ISpellError[] = [];

  isSpellchecking = false;

  isFirstRun = true;

  paragraphs: string[] = [];

  constructor(private spellcheckerService: SpellcheckerService) {
  }

  async checkGrammar(): Promise<void> {
    this.isFirstRun = false;
    this.spellingErrors = [];

    return Word.run(async (context) => {
      this.isSpellchecking = true;

      //clear highlighted errors from last round
      await this.deleteMarkers();

      const selection = context.document.getSelection();
      context.load(selection);
      await context.sync();


      let range;
      let docScope;  // true if not only a part of the document selected
      if (selection.isEmpty) {
        range = context.document.body.getRange("Whole");
        docScope = true;
      } else {
        range = selection;
        docScope = false;
      }

      context.load(range);
      await context.sync();

      let text = range.text;

      //if range is empty
      if (text.trim().length === 0) {
        this.isSpellchecking = false;
        console.log('no words found in document');
        return;
      }

      let localDictionary: string[] = [];
      if ( localStorage["localDictionary"] ) {
        localDictionary = JSON.parse( localStorage["localDictionary"] ) as string[];
      }

      text = this.replaceSpecialElements(text);

      let wordArray = text.split(/[^0-9a-zA-ZäöuàèìÄÖÜÀÈÌ'’\-]+/g);
      wordArray = wordArray.filter(function(x) {
        return x !== undefined && x != null && x != '';
      });

      const finalArray: string[] = [];
      wordArray.forEach(function(el){
        if (finalArray.indexOf(el) == -1 && localDictionary.indexOf(el) == -1 ){
          if (el.length < 50) {
            finalArray.push(el);
          }
        }
      });

      if (finalArray.length === 0) {
        this.isSpellchecking = false;
        console.log('Found no words to spellcheck');
        return;
      }

      const allErrors = await this.spellcheckerService.proofreadArray(finalArray);

      if (allErrors.length > 0) {
        this.markErrors(allErrors, docScope);
      } else {
        this.isSpellchecking = false;
        console.log('Found no errors in text');
      }
    });
  }

  addMarkers(obj: { error: ISpellError, errorIndex: number }) {
    return Word.run(async (context) => {
      try {
        const errorContentControl = context.document.body.contentControls.getById(obj.error.id);
        errorContentControl.select();
        errorContentControl.load("text");
        await context.sync();
      } catch (e) {
        console.error(e);
        this.removeErrorControl(obj.errorIndex);

        if (this.spellingErrors.length < 1) {
          await this.finishErrorLoop();
        }
      }
    });
  }

  acceptSuggestion(obj: {error: ISpellError, errorIndex: number, suggestion: string }, doNotReplace = false) {
    return Word.run(async (context) => {
      try {
        const errorContentControl = context.document.body.contentControls.getById(obj.error.id);
        context.load(errorContentControl);
        await context.sync();
        if (!doNotReplace) {
          errorContentControl.insertText(obj.suggestion, 'Replace');
        }
        errorContentControl.delete(true);

        await context.sync();
      } catch (e) {
        console.error(e);
      }
      this.removeErrorControl(obj.errorIndex);

      if (this.spellingErrors.length < 1) {
        await this.finishErrorLoop();
      }
    });
  }

  private async markErrors(errors: string[], docScope: boolean) {
    return Word.run(async (context) => {

      // order from longest to shortest word, so composed words are marked first, e.g. "ch'jau" is marked before "jau"
      //errors = errors.sort((a,b) => b.length - a.length);

      let range: Word.Range;
      if (docScope) {
        range = context.document.body.getRange("Whole");
      } else {
        range = context.document.getSelection();
      }

      context.load(range);
      await context.sync();

      const foundErrors: Array<[string, RangeCollection]> = [];
      errors.forEach(function(error: string) {
        var searchResult = range.search(error, {
          matchWholeWord: true,
          matchCase: true
        });

        searchResult.load('items');
        foundErrors.push([error, searchResult]);
      });

      await context.sync();
      try {
        for (let i = 0; i < foundErrors.length; i++) {
          if (foundErrors[i][1].items.length > 0) {

            for (const errorRange of foundErrors[i][1].items) {

              await context.load(errorRange);
              const cntntCtrl = errorRange.insertContentControl();
              cntntCtrl.appearance = "Hidden";
              cntntCtrl.tag = "xsrm";
              cntntCtrl.placeholderText = "";
            }
          }
        }

        await context.sync();
      } catch (e) {
        console.error(e);
      }

      var contentControls = context.document.body.contentControls.getByTag("xsrm");
      context.load(contentControls);

      await context.sync();

      const that = this;
      contentControls.items.forEach(function(ctrl) {
        that.spellingErrors.push({ error: ctrl.text, id: ctrl.id });
      });

      await context.sync();
      this.isSpellchecking = false;
    });
  }

  private async deleteMarkers() {
    return Word.run(async (context) => {
      var CCs = context.document.body.contentControls.getByTag("xsrm");
      context.load(CCs);
      await context.sync();

      CCs.items.forEach(function(i) {
        i.delete(true);
      });
      await context.sync();
    });
  }

  private async addToLocalDictionary(obj: {error: ISpellError, errorIndex: number, suggestion: string }, candidate: any) {
    let localDictionary: string[] = [];
    if ( localStorage["localDictionary"] ) {
      localDictionary = JSON.parse( localStorage["localDictionary"] ) as any[];
    }

    if (localDictionary.indexOf(candidate) == -1){
      localDictionary.push(candidate);
    }

    await this.acceptSuggestion(obj, true);
  }

  private async finishErrorLoop() {
    await this.deleteMarkers();
  }

  private removeErrorControl(i: number): void {
    this.spellingErrors.splice(i, 1);
  }

  private replaceSpecialElements(text: string): string {
    const urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    text = text.replace(urlRegex, "");

    var emailRegex = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    text = text.replace(emailRegex, "");

    return text;
  };
}
