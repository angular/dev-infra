import {Component, input} from '@angular/core';

@Component({
  selector: 'my-comp',
  templateUrl: './template.html',
})
export class MyComponent {
  name = input.required<string>();
}
