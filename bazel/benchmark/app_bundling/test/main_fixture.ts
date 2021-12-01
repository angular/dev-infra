import {Component, enableProdMode, NgModule} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: '<span>Hello</span>',
})
class AppComponent {}

@NgModule({
  imports: [BrowserModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
class AppModule {}

enableProdMode();

(window as any).bootstrapPromise = platformBrowser().bootstrapModule(AppModule, {
  ngZone: 'noop',
});
