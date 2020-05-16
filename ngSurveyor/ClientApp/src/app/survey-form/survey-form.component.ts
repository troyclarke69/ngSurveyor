import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/survey-form-api';
import { ActivatedRoute, Router } from '@angular/router'
import { Location } from '@angular/common'
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Guid } from "guid-typescript";

@Component({
  selector: 'app-survey-form',
  templateUrl: './survey-form.component.html',
  styleUrls: ['./survey-form.component.css']
})

export class SurveyFormComponent implements OnInit {

    stats;
    public sessionGuid;
    public session;     // obtained through api
    public qgroup = 1;  // default: 1 (one page survey), future use: iterate through multi-pages
    public surveyId;    // passed in from app

    optionHasError = true;
    submitted = false;
    errorMsg = '';

    //private _jsonURL = 'assets/test.json';

    constructor(private apiService: ApiService, private route: ActivatedRoute, private router: Router,
                  private location: Location, private http: HttpClient)
              {   var object;   }

    ngOnInit() {

        // qgroup will default to 1 ... will implement multi-paging later.
        this.route.paramMap.subscribe(params =>
        {
            this.surveyId = params.get("survey")
        })

        // create a new GUID and pass in to API to obtain sessionId       
        // as of May 10, 2020 - 1:1 Session (GUID) to Result (Survey)
        this.sessionGuid = Guid.create();
        this.apiService.postSession(this.sessionGuid, this.surveyId)
            .subscribe((data: any) => {
                this.session = data,
                    (error) => console.log(error);

                // send sessionId, newly acquired above to obtain questions for the survey
                this.apiService.fetchData(this.session, this.surveyId, this.qgroup)
                    .subscribe((data: any[]) => {
                        this.stats = data,
                            (error) => console.log(error);
                        //console.log(data);
                    })
            })     
    }

    onSubmit(f) {
        this.submitted = true;

        // UPDATE: pass in survey OR obtain surveyId from session passed in ... in API
        this.apiService.postData(f, this.session, this.surveyId)
            .subscribe((data: any[]) => {
                // returns the number of inserted rows
                this.stats = data,
                (error) => console.log(error);
                //console.log(data);
            })

        this.router.navigateByUrl('/summary-detail/' + this.surveyId + '/' + this.session);       
    }
}
