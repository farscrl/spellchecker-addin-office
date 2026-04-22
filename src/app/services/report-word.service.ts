import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { EntryVersionDto } from "../data/suggestion";
import { SettingsService } from "./settings.service";

@Injectable({
  providedIn: 'root'
})
export class ReportWordService {

  constructor(private httpClient: HttpClient, private settingsService: SettingsService) { }

  create(version: EntryVersionDto) {
    const body: any = Object.assign({}, version);
    return this.httpClient.post<EntryVersionDto>(this.getUrl(), body);
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
