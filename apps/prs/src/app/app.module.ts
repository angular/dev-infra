import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module.js';
import {AppComponent} from './app.component.js';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {environment} from '../environments/environment.js';
import {LayoutModule} from '@angular/cdk/layout';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {AccountModule} from '../../../shared/account/account.module.js';

// TODO(devversion): Remove this when Angular Fire is using APF v13+
import type * as authTypes from '@angular/fire/auth/angular-fire-auth.js';
import type * as firestoreTypes from '@angular/fire/firestore/angular-fire-firestore.js';
import type * as appTypes from '@angular/fire/app/angular-fire-app.js';

const {provideAuth, getAuth} = (await import('@angular/fire/auth' as any)) as typeof authTypes;
const {provideFirestore, getFirestore} = (await import(
  '@angular/fire/firestore' as any
)) as typeof firestoreTypes;
const {provideFirebaseApp, initializeApp} = (await import(
  '@angular/fire/app' as any
)) as typeof appTypes;

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    AccountModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
