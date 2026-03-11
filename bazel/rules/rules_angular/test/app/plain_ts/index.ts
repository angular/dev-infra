import {Component, input} from '@angular/core';
import {} from '../../app/index';
import {fine} from './other_file';

@Component({
  selector: 'my-comp',
  template: '<div></div>',
})
export class MyComponent {
  name = input.required<string>();
}
