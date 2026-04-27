import { Component } from "@angular/core";
import { TabType } from "./data/tabs";

import { SpellcheckerLegacyComponent } from "./spellchecker-legacy/spellchecker-legacy.component";
import { SpellcheckerInlineComponent } from "./spellchecker-inline/spellchecker-inline.component";
import { SettingsComponent } from "./settings/settings.component";
import { IgnoredWordsComponent } from "./ignored-words/ignored-words.component";
import { TabsComponent } from "./tabs/tabs.component";
import { MatomoTracker } from "ngx-matomo-client";
import { SettingsService } from "./services/settings.service";

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

  public useInlineView = false;
  public doesSupportInlineView = false;

  private wordApiLevel18Supported = false;
  private supportsAnnotations = false;
  private userPrefersInlineView = true;

  constructor(private matomoTracker: MatomoTracker, private settingsService: SettingsService) {
    this.settingsService.getUseInlineViewObservable().subscribe((pref) => {
      this.userPrefersInlineView = pref;
      this.updateInlineView();
    });

    this.checkWordApiLevel();
    this.isAnnotationAvailable().then((available) => {
      this.supportsAnnotations = available;
      this.matomoTracker.trackEvent(
        "supportsAnnotations",
        this.supportsAnnotations ? "true" : "false"
      );

      this.doesSupportInlineView = this.wordApiLevel18Supported && this.supportsAnnotations;

      if (this.doesSupportInlineView) {
        console.log(
          "wordAPI level 1.8 and annotations supported. Mark errors inline enabled."
        );
      } else {
        if (!this.supportsAnnotations) {
          console.warn(
            "annotations not supported. Mark errors inline disabled."
          );
        }
        if (!this.wordApiLevel18Supported) {
          console.warn(
            "wordAPI level 1.8 not supported. Mark errors inline disabled."
          );
        }
      }

      this.updateInlineView();
    });
  }

  private updateInlineView() {
    this.useInlineView = this.doesSupportInlineView && this.userPrefersInlineView;
  }

  tabChanged(type: TabType) {
    this.selectedTab = type;
  }

  private checkWordApiLevel() {
    this.wordApiLevel18Supported = Office.context.requirements.isSetSupported(
      "WordApi",
      "1.8"
    );
    this.matomoTracker.trackEvent(
      "SupportsWordAPI_1.8",
      this.wordApiLevel18Supported ? "true" : "false"
    );
  }

  private async isAnnotationAvailable() {
    try {
      await Word.run(async (ctx) => {
        const para = ctx.document.body.paragraphs.getFirst();
        para.getAnnotations().load();
        await ctx.sync();
      });
      return true;
    } catch (err) {
      if (
        err instanceof OfficeExtension.Error &&
        err.code === Word.ErrorCodes.notImplemented
      ) {
        return false;
      }
      const errorMessage =
        err instanceof Error ? err.message : JSON.stringify(err);
      this.matomoTracker.trackEvent(
        "Error",
        "isAnnotationAvailable failed",
        errorMessage
      );
      return false;
    }
  }
}
