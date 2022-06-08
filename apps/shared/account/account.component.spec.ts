import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AccountComponent} from './account.component.js';
import {AccountModule} from './account.module.js';

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an account menu when opened', () => {
    expect((component as any).accountMenuInstance).toBeFalsy();
    component.open();
    expect((component as any).accountMenuInstance).toBeTruthy();
  });
});
