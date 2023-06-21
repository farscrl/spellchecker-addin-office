import { Injectable } from '@angular/core';
import { SettingsService } from "./settings.service";
import { Language } from "../data/language";
import LanguageUtils from "../utils/language.utils";
import { HttpClient } from "@angular/common/http";
import { Proofreader } from '@farscrl/rumantsch-language-tools';
import { ITextWithPosition } from "@farscrl/rumantsch-language-tools/lib/models/data-structures";
import { Idioms } from "@farscrl/rumantsch-language-tools/lib/models/idioms";

@Injectable({
  providedIn: 'root'
})
export class SpellcheckerService {
  isLoaded = false;
  proofreader?: Proofreader.Proofreader;

  constructor(private settingsService: SettingsService, private http: HttpClient,) {
    settingsService.getLanguageObservable().subscribe(async (l) => {
      await this.loadProofreader(l);
    });
  }

  private async loadProofreader(language: Language) {
    const langCode = LanguageUtils.getLangCodeFromLanguage(language) as Idioms;
    this.proofreader = await Proofreader.Proofreader.CreateProofreader(langCode);
    this.onDictLoaded(langCode);
  }

  async proofreadText(sentence: string): Promise<ITextWithPosition[]> {
    if (!this.proofreader) {
      return Promise.resolve([]);
    }
    return this.proofreader.proofreadText(sentence);
  }

  getSuggestions(word: string): Promise<string[]> {
    if (!this.proofreader) {
      return Promise.resolve([]);
    }
    return this.proofreader.getSuggestions(word);
  }

  get version() {
    return this.proofreader?.version;
  }

  private onDictLoaded(langCode: Idioms) {
    this.isLoaded = true;
    console.log("loading spellchecker finished: " + langCode);
  }
}
