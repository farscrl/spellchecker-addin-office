import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { Language } from "../data/language";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private LANGUAGE_KEY = 'language';
  private SHOW_CONTEXT_KEY = 'show-context';

  private languageSubject = new BehaviorSubject<Language>('rumantschgrischun');

  private showContext = new BehaviorSubject<boolean>(true);

  constructor() {
    const lng = this.load(this.LANGUAGE_KEY);
    if (!!lng) {
      this.languageSubject.next(lng);
    }

    const showCtx = this.loadBoolean(this.SHOW_CONTEXT_KEY);
    if (showCtx !== undefined) {
      this.showContext.next(showCtx);
    }
  }

  getLanguageObservable(): Observable<Language> {
    return this.languageSubject.asObservable();
  }

  getLanguage(): Language {
    return this.languageSubject.getValue();
  }

  setLanguage(lng: Language) {
    this.languageSubject.next(lng);
    this.save(this.LANGUAGE_KEY, lng);
  }

  getShowContextObservable(): Observable<boolean> {
    return this.showContext.asObservable();
  }

  setShowContext(value: boolean) {
    this.showContext.next(value);
    this.save(this.SHOW_CONTEXT_KEY, value);
  }

  private save(name: string, value: any): void {
    localStorage.setItem(name, value);
  }

  private load(name: string): any {
    return localStorage.getItem(name);
  }

  private remove(name: string): void {
    localStorage.removeItem(name);
  }

  private loadBoolean(name: string): boolean | undefined {
    const value = this.load(name);
    if (!value) {
      return undefined;
    }
    return JSON.parse(value) === true;
  }
}
