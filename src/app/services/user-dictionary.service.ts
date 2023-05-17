import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";

const LOCAL_DICTIONARY_KEY = "localDictionary";

@Injectable({
  providedIn: 'root'
})
export class UserDictionaryService {

  private dictionaryWords: string[] = [];

  private dictionary = new BehaviorSubject<string[]>([]);

  constructor() {
    this.loadFromLocalstorage();
  }

  getAllEntriesObservable(): Observable<string[]> {
    return this.dictionary.asObservable();
  }

  isInDictionary(word: string) {
    return this.dictionaryWords.includes(word);
  }

  addToDictionary(word: string) {
    if (this.isInDictionary(word)) {
      return;
    }
    this.dictionaryWords.push(word);
    this.storeToLocalstorage();
  }

  removeFromDictionary(word: string) {
    this.dictionaryWords = this.dictionaryWords.filter(w => w !== word);
    this.storeToLocalstorage();
  }

  private loadFromLocalstorage(): void {
    const items = localStorage.getItem(LOCAL_DICTIONARY_KEY);
    if (items === null) {
      this.dictionaryWords = [];
    } else {
      this.dictionaryWords = JSON.parse(items);
    }
    this.dictionary.next(this.dictionaryWords);
  }

  private storeToLocalstorage(): void {
    localStorage.setItem(LOCAL_DICTIONARY_KEY, JSON.stringify(this.dictionaryWords.sort()));
    this.loadFromLocalstorage();
  }
}
