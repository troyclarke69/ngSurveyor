import { Component, OnInit } from '@angular/core';
import { ApiTemplate } from '../service/survey-fetch-api';
import { ActivatedRoute, Router } from '@angular/router'
import { Location } from '@angular/common'
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Guid } from "guid-typescript";
import survey_sample from '../survey-answer/survey_sample';
import template_sample from '../survey-answer/template_sample'

@Component({
    selector: 'app-survey-answer-template',
    templateUrl: './survey-answer-template.component.html',
    styleUrls: ['./survey-answer-template.component.css']
})

export class SurveyAnswerTemplateComponent implements OnInit {

    //public stats = [];
    public stats = {};
    public surveyId;    // passed in from app

    constructor(private apiTemplate: ApiTemplate, private route: ActivatedRoute, private router: Router,
        private location: Location, private http: HttpClient) { }

    ngOnInit() {

        this.route.paramMap.subscribe(params => {
            this.surveyId = params.get("survey")
        })
        this.apiTemplate.fetchData(this.surveyId)
            .subscribe((data: any) => {
                this.stats = data,
                    (error) => console.log('Error!!!!', error);
                //console.log(this.stats);
            })


        //this.stats = template_sample;
        //console.log(this.stats);
    }

    goback() {
        
    }

    onSubmit(form) {
        // go to survey-create/survey-header
        // pre-fill with template data (this.stats)
        //console.log(form);
        this.router.navigateByUrl('/summary-header'); 
    }
}
