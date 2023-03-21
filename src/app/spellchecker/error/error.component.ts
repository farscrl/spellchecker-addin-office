import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ITextWithPosition } from "../../data/data-structures";
import TextUtils from "../../utils/text.utils";
import { SpellcheckerService } from "../../services/spellchecker.service";

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
  highlightEvent = new EventEmitter<{ activate: boolean }>();

  @Output()
  acceptSuggestionEvent = new EventEmitter<{ suggestion: string }>();

  isOpen = false;

  suggestions: string[] = [];


  constructor(private spellcheckerService: SpellcheckerService) {
  }

  getContext(word: string) {
    return TextUtils.getContext(word, (this.context)!);
  }

  async toggle(): Promise<void> {
    if (!this.isOpen) {
      this.isOpen = true;
      this.suggestions = await this.spellcheckerService.getSuggestions(this.error!.word);
    } else {
      this.isOpen = false;
    }
  }

  sendHighlight(activate: boolean) {
    this.highlightEvent.emit({ activate });
  }

  acceptSuggestion(suggestion: string) {
    this.acceptSuggestionEvent.emit({ suggestion });
  }
}
