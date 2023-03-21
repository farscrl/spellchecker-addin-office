import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ISpellingError } from "../../data/data-structures";

@Component({
  selector: 'app-errors-list',
  templateUrl: './errors-list.component.html',
  styleUrls: ['./errors-list.component.scss']
})
export class ErrorsListComponent {

  @Input()
  spellingErrors: ISpellingError[] = [];

  @Input()
  paragraphs: string[] = [];

  @Output()
  highlightEvent = new EventEmitter<{ paragraphIndex: number, errorIndex: number, activate: boolean }>();

  @Output()
  acceptSuggestionEvent = new EventEmitter<{ paragraphIndex: number, errorIndex: number, suggestion: string }>();

  sendHighlight(paragraphIndex: number, errorIndex: number, childObj: { activate: boolean}) {
    this.highlightEvent.emit({ paragraphIndex, errorIndex, activate: childObj.activate });
  }

  acceptSuggestion(paragraphIndex: number, errorIndex: number, childObj: { suggestion: string }) {
    this.acceptSuggestionEvent.emit({ paragraphIndex, errorIndex, suggestion: childObj.suggestion });
  }
}
