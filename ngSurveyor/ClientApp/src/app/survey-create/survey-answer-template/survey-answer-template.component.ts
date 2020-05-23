import { Component, OnInit } from '@angular/core';
import { ApiService } from '../service/survey-fetch-api';
import { ActivatedRoute, Router } from '@angular/router'
import { Location } from '@angular/common'
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Guid } from "guid-typescript";

@Component({
    selector: 'app-survey-answer-template',
    templateUrl: './survey-answer-template.component.html',
    styleUrls: ['./survey-answer-template.component.css']
})

export class SurveyAnswerTemplateComponent implements OnInit {

    public stats = [];
    public surveyId;    // passed in from app

    constructor(private apiService: ApiService, private route: ActivatedRoute, private router: Router,
        private location: Location, private http: HttpClient) { }

    ngOnInit() {

        this.route.paramMap.subscribe(params => {
            this.surveyId = params.get("survey")
        })

        this.apiService.fetchData(this.surveyId)
            .subscribe((data: any) => {
                this.stats = data,
                    (error) => console.log(error);
                //console.log('data ', data);
                //console.log('stats ', this.stats);
            })       
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
