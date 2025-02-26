import { Component } from "@angular/core";
import { TabType } from "./data/tabs";

import { SpellcheckerLegacyComponent } from "./spellchecker-legacy/spellchecker-legacy.component";
import { SpellcheckerInlineComponent } from "./spellchecker-inline/spellchecker-inline.component";
import { SettingsComponent } from "./settings/settings.component";
import { IgnoredWordsComponent } from "./ignored-words/ignored-words.component";
import { TabsComponent } from "./tabs/tabs.component";
import { MatomoTracker } from "ngx-matomo-client";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  imports: [
    SpellcheckerLegacyComponent,
    SpellcheckerInlineComponent,
    SettingsComponent,
    IgnoredWordsComponent,
    TabsComponent,
  ],
})
export class AppComponent {
  selectedTab: TabType = "spellchecker";

  public wordApiLevel18Supported = false;

  constructor(private matomoTracker: MatomoTracker) {
    this.wordApiLevel18Supported = Office.context.requirements.isSetSupported(
      "WordApi",
      "1.8"
    );
    if (!this.wordApiLevel18Supported) {
      console.warn(
        "wordAPI level 1.8 not supported. Mark errors inline disabled"
      );
    }
    this.matomoTracker.trackEvent(
      "Stats",
      "Supports WordAPI 1.8",
      undefined,
      this.wordApiLevel18Supported ? 1 : 0
    );
  }

  tabChanged(type: TabType) {
    this.selectedTab = type;
  }
}
