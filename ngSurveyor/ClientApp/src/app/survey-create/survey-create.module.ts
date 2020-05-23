import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceModule } from './service/service.module';
import { SurveyHeaderComponent } from './survey-header/survey-header.component';
import { SurveyQuestionComponent } from './survey-question/survey-question.component';
import { SurveyAnswerComponent } from './survey-answer/survey-answer.component';
import { SurveyAnswerTemplateComponent } from './survey-answer-template/survey-answer-template.component'

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [SurveyHeaderComponent, SurveyQuestionComponent, SurveyAnswerComponent, SurveyAnswerTemplateComponent],
  imports: [
      CommonModule,
      ServiceModule,
      FormsModule,
      ReactiveFormsModule
    ],
    exports: [SurveyHeaderComponent]
})
export class SurveyCreateModule { }
