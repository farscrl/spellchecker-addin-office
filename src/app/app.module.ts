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
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { IgnoredWordsComponent } from './ignored-words/ignored-words.component';
import { provideDialogConfig } from '@ngneat/dialog';
import { MatomoModule } from "ngx-matomo-client/core";
import { ToastrModule } from "ngx-toastr";

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
    NgxSpinnerModule,
    VirtualScrollerModule,
    AppRoutingModule,
    FormsModule,
    MatomoModule.forRoot({
      siteId: '10', // your Matomo's site ID (find it in your Matomo's settings)
      trackerUrl: 'https://www.statistica.pledarigrond.ch', // your matomo server root url
    }),
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-center',
      maxOpened: 1,
      autoDismiss: true,
    })
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
    provideHttpClient(withInterceptorsFromDi()),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
