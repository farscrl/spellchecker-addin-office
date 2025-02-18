import { Component } from '@angular/core';
import { TabType } from "./data/tabs";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  selectedTab: TabType = 'spellchecker';

  public wordApiLevel18Supported = false;

  constructor() {
    this.wordApiLevel18Supported = Office.context.requirements.isSetSupported("WordApi", "1.8");
    if (!this.wordApiLevel18Supported) {
      console.warn('wordAPI level 1.7 not supported. Mark errors inline disabled');
    }
  }

  tabChanged(type: TabType) {
    this.selectedTab = type;
  }
}
