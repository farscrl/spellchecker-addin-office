import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TabType } from "../data/tabs";

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent {
  @Input()
  selectedTab: TabType = 'spellchecker';

  @Output()
  tabChangedEvent = new EventEmitter<TabType>();

  tabChanged(type: TabType) {
    this.tabChangedEvent.emit(type);
  }
}
