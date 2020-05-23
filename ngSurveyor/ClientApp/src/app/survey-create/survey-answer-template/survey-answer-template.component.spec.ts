import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyAnswerTemplateComponent } from './survey-answer-template.component';

describe('SurveyAnswerTemplateComponent', () => {
  let component: SurveyAnswerTemplateComponent;
  let fixture: ComponentFixture<SurveyAnswerTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyAnswerTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyAnswerTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
