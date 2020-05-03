import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryDetailComponent } from './summary-detail.component';

describe('SummaryDetailComponent', () => {
  let component: SummaryDetailComponent;
  let fixture: ComponentFixture<SummaryDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
