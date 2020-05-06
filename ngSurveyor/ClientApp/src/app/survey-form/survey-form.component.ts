import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/survey-form-api';
import { ActivatedRoute } from '@angular/router'
import { Location } from '@angular/common'
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-survey-form',
  templateUrl: './survey-form.component.html',
  styleUrls: ['./survey-form.component.css']
})

export class SurveyFormComponent implements OnInit {

    stats = [];
    public session;
    public qgroup;

    public session1 = "session1"
    public survey = "survey1";
    public question = "Question1";
    public answer = "Option1";
    public data = ['Q1', 'Q2', 'Q3', 'Q4'];
    public options = ['1', '2', '3', '4'];

    public test = [{
            "SessionId": 1, "SurveyId": 1, "Name": "Survey 1", "QuestionId": 1,
            "QuestionText": "Question 1", "AnswerVal": 1, "AnswerText": "Group 1 Choice 1"
        }, {
            "SessionId": 1, "SurveyId": 1, "Name": "Survey 1", "QuestionId": 1,
            "QuestionText": "Question 1", "AnswerVal": 2, "AnswerText": "Group 1 Choice 2"
        }, {
            "SessionId": 1, "SurveyId": 1, "Name": "Survey 1", "QuestionId": 1,
            "QuestionText": "Question 1", "AnswerVal": 3, "AnswerText": "Group 1 Choice 3"
        }, {
            "SessionId": 1, "SurveyId": 1, "Name": "Survey 1", "QuestionId": 1,
            "QuestionText": "Question 1", "AnswerVal": 4, "AnswerText": "Group 1 Choice 4"
        }, {
            "SessionId": 1, "SurveyId": 1, "Name": "Survey 1", "QuestionId": 1,
            "QuestionText": "Question 1", "AnswerVal": 5, "AnswerText": "Group 1 Choice 5"
        }];

    public questions = [{
            "SessionId": 1, "SurveyId": 1, "Name": "Survey 1", "QuestionId": 1,
            "QuestionText": "Question 1?"
        }, {
            "SessionId": 1, "SurveyId": 1, "Name": "Survey 1", "QuestionId": 2,
            "QuestionText": "Question 2?"
        }];

    public answers = [{
            "QuestionId": 1, "AnswerVal": 1, "AnswerText": "Question 1 Choice 1"
        }, {
            "QuestionId": 1, "AnswerVal": 2, "AnswerText": "Question 1 Choice 2"
        }, {
            "QuestionId": 2, "AnswerVal": 1, "AnswerText": "Question 2 Choice 1"
        }, {
            "QuestionId": 2, "AnswerVal": 2, "AnswerText": "Question 2 Choice 2"
        }];

    
    //title = 'app';
    //topics = ['Angular', 'React', 'Vue'];
    //userModel = new User('Rob', 'rob@test.com', 5556665566, 'default', 'morning', true);
    optionHasError = true;
    submitted = false;
    errorMsg = '';

    //private _jsonURL = 'assets/SampleJson-nested.json';
    private _jsonURL = 'assets/test.json';

    constructor(private apiService: ApiService, private route: ActivatedRoute,
                  private location: Location, private http: HttpClient)
              {
                  var object;
                  //this.getJSON()
                  //    .subscribe(data => object = data,
                  //        error => console.log(error));
                  //this.getJSON()
                  //    .subscribe(data => console.log(data),
                  //        error => console.log(error));
                    
              }

    ngOnInit() {

        this.route.paramMap.subscribe(params =>
        {
            this.session = params.get("session"),
            this.qgroup = params.get("qgroup")
        })

        //this.getJSON()
        //    .subscribe(data => console.log(data),
        //        error => console.log(error));

        //this.getJSON()
        //    .subscribe((data: any[]) => {
        //        this.stats = data;
        //        console.log(this.stats);
        //    })

        this.apiService.fetchData(this.session, this.qgroup)
            .subscribe((data: any[]) => {
                this.stats = data;
                console.log(data);

            })
    }

    public getJSON(): Observable<any> {
        return this.http.get(this._jsonURL);
    }

    validateOption(value) {
        if (value === 'default') {
            this.optionHasError = true;
        } else {
            this.optionHasError = false;
        }
    }

    onSubmit() {
        this.submitted = true;
        console.log('Submitted');

        //this._enrollmentService.enroll(this.userModel)
        //    .subscribe(
        //        response => console.log('Success!', response),
        //        error => this.errorMsg = error.statusText
        //    )
    }

}
