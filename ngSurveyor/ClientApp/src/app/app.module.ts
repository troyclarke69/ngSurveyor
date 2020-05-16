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

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    SummaryHeaderComponent,
    SummaryDetailComponent,
    SurveyFormComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
      GoogleChartModule,

    RouterModule.forRoot([
        { path: '', component: HomeComponent, pathMatch: 'full' },
        { path: 'counter', component: CounterComponent },
        { path: 'fetch-data', component: FetchDataComponent },
        { path: 'summary-header', component: SummaryHeaderComponent },
        { path: 'summary-detail/:survey/:session', component: SummaryDetailComponent },
        { path: 'survey-form/:session/:survey/:qgroup', component: SurveyFormComponent },
        { path: 'survey-form/:survey', component: SurveyFormComponent },
    ])

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
