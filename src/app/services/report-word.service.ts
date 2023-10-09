import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { LemmaVersion } from "../data/suggestion";
import { SettingsService } from "./settings.service";

@Injectable({
  providedIn: 'root'
})
export class ReportWordService {

  constructor(private httpClient: HttpClient, private settingsService: SettingsService) { }

  create(version: LemmaVersion) {
    const body: any = Object.assign({}, version);
    return this.httpClient.post<LemmaVersion>(this.getUrl(), body);
  }

  private getUrl(): string {
    let base = 'https://api.pledarigrond.ch';
    const language = this.settingsService.getLanguage()
    if (language === 'puter' || language === 'vallader') {
      base = 'https://admin-api.dicziunaris-ladins.ch';
    }
    return base + "/" + language + "/user/modify/new";
  }
}
