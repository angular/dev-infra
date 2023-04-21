import {CdkAccordionModule} from '@angular/cdk/accordion';
import {Overlay, OverlayModule} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {Component, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';
import {AccountService} from './account.service.js';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    CdkAccordionModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    OverlayModule,
    MatTooltipModule,
  ],
  selector: 'account-menu-button',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
  /** The overlay used to display the account menu. */
  private overlayRef = this.overlay.create();

  /** The projected content provided to the template for insertion into the account menu.  */
  @ViewChild('menuContent', {static: true}) private projected!: TemplateRef<any>;

  /** The menu template portal.  */
  portal!: TemplatePortal;

  constructor(
    private vcr: ViewContainerRef,
    private overlay: Overlay,
    public account: AccountService,
  ) {}

  ngOnInit() {
    /** Create the template portal using the template from the component template. */
    this.portal = new TemplatePortal(this.projected, this.vcr);
    // Close the menu whenever a click outside the menu occurs.
    this.overlayRef.outsidePointerEvents().subscribe(() => this.close());
    // Close the menu if the login state changes while the menu is open.
    this.account.loggedInStateChange.subscribe(() => this.close());
    // Set the positioning of the overlay to be attached to the container component.
    this.overlayRef.updatePositionStrategy(
      this.overlay
        .position()
        .flexibleConnectedTo(this.vcr.element.nativeElement)
        .withPositions([
          {
            offsetX: -16,
            offsetY: 16,
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'top',
          },
        ]),
    );
  }

  /** Open the account menu. */
  open() {
    this.portal.attach(this.overlayRef);
  }

  /** Close the account menu. */
  close() {
    if (this.portal.isAttached) {
      this.portal.detach();
    }
  }
}
