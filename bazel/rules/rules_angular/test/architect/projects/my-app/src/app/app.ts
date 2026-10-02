import {Component} from '@angular/core';
import {MyLib} from 'my-lib';

@Component({
  selector: 'app-root',
  imports: [MyLib],
  template: `<lib-my-lib />`,
})
export class App {}
