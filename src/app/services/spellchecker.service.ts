import { Injectable } from '@angular/core';
import { Hunspell, HunspellFactory, loadModule } from "hunspell-asm";
import tokenize from "@stdlib/nlp-tokenize";
import { ITextWithPosition } from "../data/data-structures";
import { SettingsService } from "./settings.service";
import { Language } from "../data/language";
import LanguageUtils from "../utils/language.utils";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SpellcheckerService {

  hunspellFactory?: HunspellFactory;
  affFile?: string;
  dictFile?: string;
  hunspell?: Hunspell;

  punctuation = ['-', '"', '.', '©', '', ':', ';', '!', '+', ',', '(', ')', '{', '}', '[', ']', '?', '|', "«", "»", "“", "”", "„", "‟",  "/", "%", "–", "…"];
  isLoaded = false;

  version = '';

  constructor(private settingsService: SettingsService, private http: HttpClient,) {
    settingsService.getLanguageObservable().subscribe(l => {
      this.loadDictionary(l);
    });
  }

  proofreadText(sentence: string): Promise<ITextWithPosition[]> {
    sentence = this.replaceSpecialElements(sentence);
    const tokens = this.tokenizeString(sentence);
    const errors: ITextWithPosition[] = [];

    tokens.forEach(tkn => {
      if (!this.hunspell!.spell(this.removeSpecialChars(tkn.word))) {
        errors.push(tkn);
      }
    });

    return Promise.resolve(errors);
  }

  getSuggestions(word: string): Promise<string[]> {
    return Promise.resolve(this.hunspell!.suggest(this.removeSpecialChars(word)));
  }

  private async loadDictionary(language: Language) {
    this.hunspellFactory = await loadModule();

    const langCode = LanguageUtils.getLangCodeFromLanguage(language);

    const aff = await fetch(`assets/hunspell/${langCode}/${langCode}.aff`);
    const affBuffer = new Uint8Array(await aff.arrayBuffer());
    this.affFile = this.hunspellFactory.mountBuffer(affBuffer, `${langCode}.aff`);

    const dic = await fetch(`assets/hunspell/${langCode}/${langCode}.dic`);
    const dicBuffer = new Uint8Array(await dic.arrayBuffer());
    this.dictFile = this.hunspellFactory.mountBuffer(dicBuffer, `${langCode}.dic`);

    this.hunspell = this.hunspellFactory.create(this.affFile, this.dictFile);
    this.onDictLoaded(langCode);
  }

  private onDictLoaded(langCode: string) {
    this.isLoaded = true;
    this.loadVersion(langCode);
    console.log("loading spellchecker finished: " + langCode);
  }

  private loadVersion(langCode: string) {
    this.http.get(`assets/hunspell/${langCode}/${langCode}_version.txt`, {responseType: 'text'}).subscribe(version => {
      this.version = version;
    });
  }

  private tokenizeString(text: string): ITextWithPosition[] {
    const tkns = tokenize(text, false) as string[];
    const tokens: ITextWithPosition[] = [];

    let trimmedOffset = 0;

    tkns.forEach(tkn => {
      if (this.punctuation.includes(tkn)) {
        return;
      }

      if (this.isNumeric(tkn)) {
        return;
      }

      tkn = this.normalizeString(tkn);

      const index = text.indexOf(tkn, trimmedOffset);
      tokens.push({
        offset: index,
        length: tkn.length,
        word: tkn
      });
      trimmedOffset = (index + tkn.length);
    });

    return tokens;
  }

  private isNumeric(str: string) {
    if (typeof str != "string") {
      return false;
    }

    // @ts-ignore
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

  private normalizeString(tkn: string) {
    if (tkn === "") {
      return "";
    }

    let didChange = false;

    do {
      didChange = false;
      const first = tkn.charAt(0);
      if (tkn !== "" && this.punctuation.includes(first)) {
        tkn = tkn.slice(1, tkn.length);
        didChange = true;
      }
    } while (didChange);

    if (tkn === "") {
      return "";
    }

    do {
      didChange = false;
      const last = tkn.slice(-1);
      if (tkn !== "" && this.punctuation.includes(last)) {
        tkn = tkn.slice(0, tkn.length - 1);
        didChange = true;
      }
    } while (didChange);

    return tkn;
  }

  private removeSpecialChars(text: string): string {
    // remove soft hyphen, zero-width space, thin space
    return text.replace(/[\u00AD\u200B\u2009]+/g,'');
  }

  private replaceSpecialElements(text: string): string {
    const urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    text = text.replace(urlRegex, "");

    var emailRegex = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    text = text.replace(emailRegex, "");

    return text;
  };
}
