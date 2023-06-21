import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import TextUtils from "../../utils/text.utils";
import { SpellcheckerService } from "../../services/spellchecker.service";
import { DialogRef, DialogService } from "@ngneat/dialog";
import { LemmaVersion } from "../../data/suggestion";
import { ReportWordService } from "../../services/report-word.service";
import { ITextWithPosition } from "@farscrl/rumantsch-language-tools/lib/models/data-structures";

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {

  @Input()
  error?: ITextWithPosition;

  @Input()
  context?: string;

  @Input()
  showContext: boolean = true;

  @Output()
  highlightEvent = new EventEmitter();

  @Output()
  acceptSuggestionEvent = new EventEmitter<{ suggestion: string }>();

  @Output()
  ignoreWordEvent = new EventEmitter<{ word: string }>();

  isOpen = false;

  suggestions: string[] = [];

  @ViewChild('reportDialog') reportDialog?: TemplateRef<any>;
  dialogRef?: DialogRef;
  wordToReport?: string;

  constructor(
      private spellcheckerService: SpellcheckerService,
      private dialogService: DialogService,
      private reportWordService: ReportWordService,
  ) {
  }

  getContext(word: string) {
    return TextUtils.getContext(word, (this.context)!);
  }

  async toggle(): Promise<void> {
    if (!this.isOpen) {
      this.isOpen = true;
      this.suggestions = await this.spellcheckerService.getSuggestions(this.error!.word);
      this.sendHighlight()
    } else {
      this.isOpen = false;
    }
  }

  sendHighlight() {
    this.highlightEvent.emit();
  }

  acceptSuggestion(suggestion: string) {
    this.acceptSuggestionEvent.emit({ suggestion });
  }

  ignoreWord(word: string) {
    this.ignoreWordEvent.emit({ word});
  }

  reportWord(word: string) {
    this.wordToReport = word;
    this.dialogRef = this.dialogService.open(this.reportDialog!);
    this.dialogRef.afterClosed$.subscribe((result) => {
      if (!!result) {
        this.sendWordToServer(word);
      }
    });
  }

  sendWordToServer(word: string) {
    const lemmaVersion = new LemmaVersion();
    lemmaVersion.lemmaValues.RStichwort = word;
    lemmaVersion.lemmaValues.DStichwort = '';
    lemmaVersion.lemmaValues.contact_comment = 'Proposta via spellchecker Word';

    this.reportWordService.create(lemmaVersion).subscribe(data => {
      const suggestionsBox = document.getElementById('suggestions-box');
      if (suggestionsBox) {
        suggestionsBox.textContent = '';
        suggestionsBox.style.display = 'none'
      }
    }, error => {
      console.error(error);
    });

  }
}
