import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { TabType } from "../data/tabs";

@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
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
