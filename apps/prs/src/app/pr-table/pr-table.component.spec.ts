import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PrTableComponent} from './pr-table.component.js';

describe('PrTableComponent', () => {
  let component: PrTableComponent;
  let fixture: ComponentFixture<PrTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
