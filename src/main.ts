import { enableProdMode, importProvidersFrom } from '@angular/core';


import { environment } from './environments/environment';
import { provideDialogConfig } from '@ngneat/dialog';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { VirtualScrollerModule } from '@iharbeck/ngx-virtual-scroller';
import { AppRoutingModule } from './app/app-routing.module';
import { FormsModule } from '@angular/forms';
import { MatomoModule } from 'ngx-matomo-client/core';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app/app.component';

if (environment.production) {
    enableProdMode();
}

Office.initialize = () => {
    // Bootstrap the app
    bootstrapApplication(AppComponent, {
        providers: [
            importProvidersFrom(
                BrowserModule,
                NgxSpinnerModule,
                VirtualScrollerModule,
                AppRoutingModule,
                FormsModule,
                MatomoModule.forRoot({
                    siteId: "10", // your Matomo's site ID (find it in your Matomo's settings)
                    trackerUrl: "https://www.statistica.pledarigrond.ch", // your matomo server root url
                }),
                ToastrModule.forRoot({
                    positionClass: "toast-bottom-center",
                    maxOpened: 1,
                    autoDismiss: true,
                })
            ),
            provideDialogConfig({
                closeButton: true,
                enableClose: false,
                backdrop: true,
                resizable: false,
                draggable: false,
                windowClass: "modal-dialog",
                width: "calc(100vw - 40px)",
            }),
            provideHttpClient(withInterceptorsFromDi()),
            provideAnimations(),
        ]
    })
        .catch(error => console.error(error));
};
