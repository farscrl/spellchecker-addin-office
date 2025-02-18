import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ISpellingError } from "../../data/data-structures";
import { SettingsService } from "../../services/settings.service";
import { Subscription } from "rxjs";

@Component({
    selector: 'app-errors-list-legacy',
    templateUrl: './errors-list-legacy.component.html',
    styleUrls: ['./errors-list-legacy.component.scss'],
    standalone: false
})
export class ErrorsListLegacyComponent implements OnInit, OnDestroy {

  @Input()
  spellingErrors: ISpellingError[] = [];

  @Input()
  paragraphs: string[] = [];

  @Output()
  highlightEvent = new EventEmitter<{ paragraphIndex: number, errorIndex: number }>();

  @Output()
  acceptSuggestionEvent = new EventEmitter<{ paragraphIndex: number, errorIndex: number, suggestion: string }>();

  @Output()
  ignoreWordEvent = new EventEmitter<{ paragraphIndex: number, errorIndex: number, word: string }>();

  showContext = true;

  private settingsServiceSubscription?: Subscription;

  constructor(private settingsService: SettingsService) {
  }

  ngOnInit() {
    this.settingsServiceSubscription = this.settingsService.getShowContextObservable().subscribe(value => {
      this.showContext = value;
    });
  }

  ngOnDestroy() {
    if (this.settingsServiceSubscription) {
      this.settingsServiceSubscription.unsubscribe();
    }
  }

  sendHighlight(paragraphIndex: number, errorIndex: number) {
    this.highlightEvent.emit({ paragraphIndex, errorIndex });
  }

  acceptSuggestion(paragraphIndex: number, errorIndex: number, childObj: { suggestion: string }) {
    this.acceptSuggestionEvent.emit({ paragraphIndex, errorIndex, suggestion: childObj.suggestion });
  }

  ignoreWord(paragraphIndex: number, errorIndex: number, childObj: { word: string }) {
    this.ignoreWordEvent.emit({ paragraphIndex, errorIndex, word: childObj.word });
  }
}
