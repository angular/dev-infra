import {Component, NgModule} from '@angular/core';

@Component({
  template: 'Works!',
})
export class TestCmp {}

@NgModule({
  declarations: [TestCmp],
  bootstrap: [TestCmp],
})
export class AppModule {}
