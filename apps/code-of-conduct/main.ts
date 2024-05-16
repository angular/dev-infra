import 'zone.js';
import {enableProdMode, importProvidersFrom} from '@angular/core';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {getAuth, provideAuth} from '@angular/fire/auth';
import {bootstrapApplication} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {provideRouter} from '@angular/router';
import {AppComponent} from './app/app.component.js';
import {routes} from './app/app.routes.js';
import {environment} from './environment.js';
import {provideFunctions, getFunctions} from '@angular/fire/functions';
import {provideFirestore, getFirestore} from '@angular/fire/firestore';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom([BrowserAnimationsModule]),
    importProvidersFrom(provideFirebaseApp(() => initializeApp(environment.firebase))),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideFunctions(() => getFunctions())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
  ],
});
