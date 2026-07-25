import { Component, Input, OnDestroy, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { SettingsService } from "../services/settings.service";
import { Language } from "../data/language";
import { Subscription } from "rxjs";
import { SpellcheckerService } from "../services/spellchecker.service";
import { FormsModule } from "@angular/forms";
import { VERSION_INFO } from "../../environments/version";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule],
})
export class SettingsComponent implements OnInit, OnDestroy {
  @Input() doesSupportInlineView = false;

  language: Language = "rumantschgrischun";
  showContext = true;
  useInlineViewPref = true;

  public appVersion = "-";
  public gitHash = "-";

  private languageSubscription?: Subscription;
  private showContextSubscription?: Subscription;
  private useInlineViewSubscription?: Subscription;

  constructor(
    private settingsService: SettingsService,
    public spellcheckerService: SpellcheckerService
  ) {}

  ngOnInit() {
    this.appVersion = VERSION_INFO.version;
    this.gitHash = VERSION_INFO.gitHash;
    this.languageSubscription = this.settingsService
      .getLanguageObservable()
      .subscribe((lng) => {
        this.language = lng;
      });

    this.showContextSubscription = this.settingsService
      .getShowContextObservable()
      .subscribe((ctx) => {
        this.showContext = ctx;
      });

    this.useInlineViewSubscription = this.settingsService
      .getUseInlineViewObservable()
      .subscribe((pref) => {
        this.useInlineViewPref = pref;
      });
  }

  ngOnDestroy() {
    this.languageSubscription?.unsubscribe();
    this.showContextSubscription?.unsubscribe();
    this.useInlineViewSubscription?.unsubscribe();
  }

  languageSelected(lng: Language) {
    this.settingsService.setLanguage(lng);
  }

  showContextChanged(value: boolean) {
    this.settingsService.setShowContext(value);
  }

  useInlineViewChanged(value: boolean) {
    this.settingsService.setUseInlineView(value);
  }
}
