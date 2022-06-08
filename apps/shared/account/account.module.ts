import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AccountComponent} from './account.component.js';
import {OverlayModule} from '@angular/cdk/overlay';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {CdkAccordionModule} from '@angular/cdk/accordion';
import {AccountService} from './account.service.js';

@NgModule({
  declarations: [AccountComponent],
  imports: [
    CommonModule,
    CdkAccordionModule,
    MatButtonModule,
    MatIconModule,
    OverlayModule,
    MatTooltipModule,
  ],
  providers: [AccountService],
  exports: [AccountComponent],
})
export class AccountModule {}
