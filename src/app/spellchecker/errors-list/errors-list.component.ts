import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ISpellError } from "../../data/data-structures";
import { SettingsService } from "../../services/settings.service";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-errors-list',
  templateUrl: './errors-list.component.html',
  styleUrls: ['./errors-list.component.scss']
})
export class ErrorsListComponent implements OnInit, OnDestroy {

  @Input()
  spellingErrors: ISpellError[] = [];

  @Input()
  paragraphs: string[] = [];

  @Output()
  highlightEvent = new EventEmitter<{ error: ISpellError, errorIndex: number }>();

  @Output()
  acceptSuggestionEvent = new EventEmitter<{ error: ISpellError, errorIndex: number, suggestion: string }>();

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

  sendHighlight(error: ISpellError, errorIndex: number) {
    this.highlightEvent.emit({ error, errorIndex });
  }

  acceptSuggestion(error: ISpellError, errorIndex: number, childObj: { suggestion: string }) {
    this.acceptSuggestionEvent.emit({ error, errorIndex, suggestion: childObj.suggestion });
  }
}
