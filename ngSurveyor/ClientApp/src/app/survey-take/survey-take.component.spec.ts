import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyTakeComponent } from './survey-take.component';

describe('SurveyTakeComponent', () => {
  let component: SurveyTakeComponent;
  let fixture: ComponentFixture<SurveyTakeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyTakeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyTakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
