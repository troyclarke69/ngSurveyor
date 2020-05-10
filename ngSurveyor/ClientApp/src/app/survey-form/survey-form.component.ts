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

    stats = [];
    public session; // obtained through api
    public qgroup = 1; // default: 1 (one page survey), future use: iterate through multi-pages
    public surveyId; //passed in from app

    //public session1 = "session1"
    public survey = "survey1";
    //public question = "Question1";
    //public answer = "Option1";
    //public data = ['Q1', 'Q2', 'Q3', 'Q4'];
    //public options = ['1', '2', '3', '4'];
    
    //title = 'app';
    //topics = ['Angular', 'React', 'Vue'];
    //userModel = new User('Rob', 'rob@test.com', 5556665566, 'default', 'morning', true);
    optionHasError = true;
    submitted = false;
    errorMsg = '';

    //private _jsonURL = 'assets/SampleJson-nested.json';
    private _jsonURL = 'assets/test.json';

    constructor(private apiService: ApiService, private route: ActivatedRoute, private router: Router,
                  private location: Location, private http: HttpClient)
              {   var object;   }

    ngOnInit() {

        // 05-09-20 NOT passing in Session & qroup here ...
        // can get survey ID - we NEED this        
        // so must enter record in SESSION table
        // create GUID, call API
        // receive Session ID
        // qgroup will default to 1 ... will implement multi-paging later.
        this.route.paramMap.subscribe(params =>
        {
            this.surveyId = params.get("survey")
        })

        // create a new GUID and pass in to API to obtain sessionId
        var sessionGuid = Guid.create();
        this.apiService.postSession(sessionGuid, this.surveyId)
            .subscribe((data: any) => {
                this.session = data,
                    (error) => console.log(error);

                // send sessionId, newly acquired above to obtain questions for the survey
                this.apiService.fetchData(this.session, this.qgroup)
                    .subscribe((data: any[]) => {
                        this.stats = data,
                            (error) => console.log(error);
                        //console.log(data);
                    })
                //console.log('After postSession: ', this.session);
            })     
    }

     //this.getJSON()
        //    .subscribe(data => console.log(data),
        //        error => console.log(error));

        //this.getJSON()
        //    .subscribe((data: any[]) => {
        //        this.stats = data;
        //        console.log(this.stats);
        //    })

    //submit() {
    //    console.log('submit');
    //    //console.log();
    //}

    //public getJSON(): Observable<any> {
    //    return this.http.get(this._jsonURL);
    //}

    //validateOption(value) {
    //    if (value === 'default') {
    //        this.optionHasError = true;
    //    } else {
    //        this.optionHasError = false;
    //    }
    //}

    onSubmit(f) {
        this.submitted = true;
        //console.log('submitted', f);

        // UPDATE: pass in survey OR obtain surveyId from session passed in ... in API
        this.apiService.postData(f, this.session)
            .subscribe((data: any[]) => {
                // returns the number of inserted rows
                // compare to number of questions ... ?
                this.stats = data,
                (error) => console.log(error);
                //console.log(data);
            })

        this.router.navigateByUrl('/summary-detail/' + this.surveyId + '/' + this.session);       

    }

}
