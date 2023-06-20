import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SettingsComponent } from './settings/settings.component';
import { SpellcheckerComponent } from './spellchecker/spellchecker.component';
import { TabsComponent } from './tabs/tabs.component';
import { ErrorsListComponent } from './spellchecker/errors-list/errors-list.component';
import { ErrorComponent } from './spellchecker/error/error.component';
import { HighlightPipe } from './pipes/highlight.pipe';
import { NgxSpinnerModule } from "ngx-spinner";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { VirtualScrollerModule } from "@iharbeck/ngx-virtual-scroller";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { IgnoredWordsComponent } from './ignored-words/ignored-words.component';
import { provideDialogConfig } from '@ngneat/dialog';

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    SpellcheckerComponent,
    TabsComponent,
    ErrorsListComponent,
    ErrorComponent,
    HighlightPipe,
    IgnoredWordsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxSpinnerModule,
    VirtualScrollerModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [
    provideDialogConfig({
      closeButton: true,
      enableClose: false,
      backdrop: true,
      resizable: false,
      draggable: false,
      windowClass: 'modal-dialog',
      width: 'calc(100vw - 40px)'
    }),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
