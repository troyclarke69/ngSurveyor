import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { SummaryHeaderComponent } from './summary-header/summary-header.component';
import { SummaryDetailComponent } from './summary-detail/summary-detail.component';
import { SurveyFormComponent } from './survey-form/survey-form.component';

import { GoogleChartModule } from './google-chart/google-chart.module'
import { SurveyCreateModule } from './survey-create/survey-create.module'
import { SurveyHeaderComponent } from './survey-create/survey-header/survey-header.component';
import { SurveyQuestionComponent } from './survey-create/survey-question/survey-question.component';
import { SurveyAnswerTemplateComponent } from './survey-create/survey-answer-template/survey-answer-template.component';
import { SurveyAnswerComponent } from './survey-create/survey-answer/survey-answer.component';
import { SurveyListComponent } from './survey-list/survey-list.component';
import { SurveyTakeComponent } from './survey-take/survey-take.component';
import { UserModule } from './user/user.module';
import { SignInComponent } from './user/sign-in/sign-in.component';
import { SignUpComponent } from './user/sign-up/sign-up.component';
import { ProfileComponent } from './user/profile/profile.component';
import { AuthGuard } from './user/auth.guard';
import { UserRequestInterceptor } from './user/user.request.interceptor';

//import { ToastrModule } from "ngx-toastr";

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    SummaryHeaderComponent,
    SummaryDetailComponent,
    SurveyFormComponent,
    SurveyListComponent,
    SurveyTakeComponent
  ],
  imports: [
      BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
      HttpClientModule,
      FormsModule,
      GoogleChartModule,
      SurveyCreateModule,
      UserModule,
      //ToastrModule,

    RouterModule.forRoot([
        { path: '', component: HomeComponent, pathMatch: 'full' },
        { path: 'counter', component: CounterComponent },
        { path: 'fetch-data', component: FetchDataComponent },
        { path: 'summary-header', component: SummaryHeaderComponent },
        { path: 'survey-list', component: SurveyListComponent },
        { path: 'summary-detail/:survey/:session', component: SummaryDetailComponent },
        { path: 'survey-form/:session/:survey/:qgroup', component: SurveyFormComponent },
        { path: 'survey-form/:survey', component: SurveyFormComponent },
        { path: 'survey-take/:survey', component: SurveyTakeComponent },

        { path: 'survey-create/survey-header', component: SurveyHeaderComponent },
        { path: 'survey-create/survey-question/:survey', component: SurveyQuestionComponent, canActivate: [AuthGuard] },
        { path: 'survey-create/survey-answer-template/:survey', component: SurveyAnswerTemplateComponent },
        { path: 'survey-create/survey-answer', component: SurveyAnswerComponent },

        { path: 'user/sign-in', component: SignInComponent },
        { path: 'user/sign-up', component: SignUpComponent },
        { path: 'user/profile', component: ProfileComponent, canActivate: [AuthGuard] },


    ]),

  ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: UserRequestInterceptor,
            multi: true
        },
        AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
