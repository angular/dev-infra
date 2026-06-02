import {Component} from '@angular/core';

@Component({
  selector: 'base-component',
  templateUrl: './base.component.html',
})
export class BaseComponent {
  counterValue = 0;

  updateCounter() {
    this.counterValue++;
  }
}
