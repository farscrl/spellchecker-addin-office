import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { DialogRef, DialogService } from "@ngneat/dialog";
import { SettingsService } from "../../services/settings.service";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
import { Language } from "../../data/language";
import { LemmaValues, LemmaVersion } from "../../data/suggestion";
import { FormsModule } from "@angular/forms";
import { ReportWordService } from "../../services/report-word.service";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-suggestion-box",
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: "./suggestion-box.component.html",
  styleUrl: "./suggestion-box.component.scss",
})
export class SuggestionBoxComponent implements OnInit {
  @ViewChild("suggestionDialog") suggestionDialog?: TemplateRef<any>;
  dialogRef?: DialogRef;

  private languageSubscription?: Subscription;
  language: Language = "rumantschgrischun";

  lemmaValues = new LemmaValues();

  error = "";

  constructor(
    private dialogService: DialogService,
    private settingsService: SettingsService,
    private reportWordService: ReportWordService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.languageSubscription = this.settingsService
      .getLanguageObservable()
      .subscribe((lng) => {
        this.language = lng;
      });
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  openSuggestionDialog(): void {
    this.lemmaValues = new LemmaValues();

    this.dialogRef = this.dialogService.open(this.suggestionDialog!);
    this.dialogRef.afterClosed$.subscribe((result) => {
      if (!!result) {
        console.log(result);
      }
    });
  }

  sendSuggestion() {
    this.error = "";

    if (!this.lemmaValues.RStichwort?.trim()) {
      this.error = "P. pl. almain endatar in pled rumantsch.";
      return;
    }

    this.lemmaValues.contact_comment = this.lemmaValues.contact_comment?.trim();
    if (this.lemmaValues.contact_comment) {
      this.lemmaValues.contact_comment =
        this.lemmaValues.contact_comment + "\n\n";
    }
    this.lemmaValues.contact_comment =
      this.lemmaValues.contact_comment + "Proposta via spellchecker Word";

    const lemmaVersion = new LemmaVersion();
    lemmaVersion.lemmaValues = this.lemmaValues;

    this.reportWordService.create(lemmaVersion).subscribe({
      next: (result) => {
        this.toastr.info(
          `Tramess il pled «${this.lemmaValues.RStichwort}» a la redacziun.`
        );
        this.dialogRef?.close();
      },
      error: (err) => {
        this.error = "Errur cun trametter il pled.";
        console.error(err);
      },
    });
  }

  get languageText() {
    switch (this.language) {
      case "puter":
        return "puter";
      case "rumantschgrischun":
        return "rumantsch grischun";
      case "sursilvan":
        return "sursilvan";
      case "sutsilvan":
        return "sutsilvan";
      case "surmiran":
        return "surmiran";
      case "vallader":
        return "vallader";
    }
    return "";
  }
}
