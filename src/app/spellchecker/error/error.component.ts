import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ISpellError } from "../../data/data-structures";
import { SpellcheckerService } from "../../services/spellchecker.service";

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {

  @Input()
  error?: ISpellError;

  @Output()
  highlightEvent = new EventEmitter();

  @Output()
  acceptSuggestionEvent = new EventEmitter<{ suggestion: string }>();

  isOpen = false;

  suggestions: string[] = [];


  constructor(private spellcheckerService: SpellcheckerService) {
  }

  async toggle(): Promise<void> {
    if (!this.isOpen) {
      this.isOpen = true;
      this.suggestions = await this.spellcheckerService.getSuggestions(this.error!.error);
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
}
