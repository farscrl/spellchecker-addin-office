import { Component, OnDestroy, OnInit } from '@angular/core';
import { SettingsService } from "../services/settings.service";
import { Language } from "../data/language";
import { Subscription } from "rxjs";
import { SpellcheckerService } from "../services/spellchecker.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

  language: Language = 'surmiran';

  showContext: boolean = true;

  private languageSubscription?: Subscription;
  private showContextSubscription?: Subscription;

  constructor(private settingsService: SettingsService, public spellcheckerService: SpellcheckerService) {
  }

  ngOnInit() {
    this.languageSubscription = this.settingsService.getLanguageObservable().subscribe(lng => {
      this.language = lng;
    });

    this.showContextSubscription = this.settingsService.getShowContextObservable().subscribe(ctx => {
      this.showContext = ctx;
    });
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }

    if (this.showContextSubscription) {
      this.showContextSubscription.unsubscribe();
    }
  }

  languageSelected(lng: Language) {
    this.settingsService.setLanguage(lng);
  }

  showContextChanged(value: boolean) {
    this.settingsService.setShowContext(value);
  }
}
