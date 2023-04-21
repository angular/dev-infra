import 'zone.js';
import {enableProdMode, importProvidersFrom} from '@angular/core';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {getAuth, provideAuth} from '@angular/fire/auth';
import {MatNativeDateModule} from '@angular/material/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {provideRouter} from '@angular/router';
import {AppComponent} from './app/app.component.js';
import {routes} from './app/app.routes.js';
import {environment} from './environment.js';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom([BrowserAnimationsModule, MatNativeDateModule]),
    importProvidersFrom(provideFirebaseApp(() => initializeApp(environment.firebase))),
    importProvidersFrom(provideAuth(() => getAuth())),
  ],
});
