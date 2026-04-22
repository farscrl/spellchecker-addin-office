import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { DialogRef, DialogService } from "@ngneat/dialog";
import { SettingsService } from "../../services/settings.service";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
import { Language } from "../../data/language";
import { EntryVersionDto } from "../../data/suggestion";
import { FormsModule } from "@angular/forms";
import { ReportWordService } from "../../services/report-word.service";
import LanguageUtils from "../../utils/language.utils";

@Component({
  selector: "app-suggestion-box",
  imports: [FormsModule],
  templateUrl: "./suggestion-box.component.html",
  styleUrl: "./suggestion-box.component.scss",
})
export class SuggestionBoxComponent implements OnInit {
  @ViewChild("suggestionDialog") suggestionDialog?: TemplateRef<any>;
  dialogRef?: DialogRef;

  private languageSubscription?: Subscription;
  language: Language = "rumantschgrischun";

  entryVersionDto = new EntryVersionDto();

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
    this.entryVersionDto = new EntryVersionDto();

    this.dialogRef = this.dialogService.open(this.suggestionDialog!);
    this.dialogRef.afterClosed$.subscribe((result) => {
      if (!!result) {
        console.log(result);
      }
    });
  }

  sendSuggestion() {
    this.error = "";

    if (!this.entryVersionDto.rmStichwort?.trim()) {
      this.error = "P.pl. almain endatar in pled rumantsch.";
      return;
    }

    this.entryVersionDto.userComment = this.entryVersionDto.userComment?.trim();
    if (this.entryVersionDto.userComment) {
      this.entryVersionDto.userComment = this.entryVersionDto.userComment + "\n\n";
    }
    this.entryVersionDto.userComment = this.entryVersionDto.userComment + "Proposta via spellchecker Word";

    this.reportWordService.create(this.entryVersionDto).subscribe({
      next: (result) => {
        this.toastr.info(
          `Tramess il pled «${this.entryVersionDto.rmStichwort}» a la redacziun.`
        );
        this.dialogRef?.close();
      },
      error: (err) => {
        this.error = "Errur cun trametter il pled.";
        console.error(err);
      },
    });
  }

  protected readonly LanguageUtils = LanguageUtils;
}
