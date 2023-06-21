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
    switch (this.settingsService.getLanguage()) {
      case "puter":
        // TODO: implement me
        return "";
      case "surmiran":
        return 'https://api.pledarigrond.ch/surmiran/user/modify/new';
      case "rumantschgrischun":
        return 'https://api.pledarigrond.ch/rumantschgrischun/user/modify/new';
      case "sursilvan":
        // TODO: implement me
        return "";
      case "sutsilvan":
        return 'https://api.pledarigrond.ch/sutsilvan/user/modify/new';
      case "vallader":
        // TODO: implement me
        return "";
    }

    return "";
  }
}
