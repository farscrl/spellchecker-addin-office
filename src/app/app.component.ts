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

  public isLegacyViewDisplayed = false;
  public isInlineViewDisplayed = false;

  private wordApiLevel18Supported = false;
  private supportsAnnotations = false;

  constructor(private matomoTracker: MatomoTracker) {
    this.checkWordApiLevel();
    this.isAnnotationAvailable().then((available) => {
      this.supportsAnnotations = available;
      this.matomoTracker.trackEvent(
        "supportsAnnotations",
        this.supportsAnnotations ? "true" : "false"
      );

      if (this.supportsAnnotations && this.wordApiLevel18Supported) {
        console.log(
          "wordAPI level 1.8 and annotations supported. Mark errors inline enabled."
        );
        this.isInlineViewDisplayed = true;
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
        this.isLegacyViewDisplayed = true;
      }
    });
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
