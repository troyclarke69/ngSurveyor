import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Guid } from "guid-typescript";
import { ActivatedRoute, Router } from '@angular/router'
import { ApiService } from '../service/survey-create-api';
import { ApiSvc } from '../service/survey-option-api';

@Component({
    selector: 'app-survey-question',
    templateUrl: './survey-question.component.html',
    styleUrls: ['./survey-question.component.css']
})

export class SurveyQuestionComponent implements OnInit {

    public sur: FormGroup;
    public sessionGuid;
    public stats = [];
    public groups = [];
    public survey;

    constructor(private _fb: FormBuilder, private router: Router,
        private apiService: ApiService, private apiSvc: ApiSvc) { }

    ngOnInit() {
        //console.log('ngOninit');

        // load auto-fill answer-groups
        this.apiSvc.fetchGroups()
            .subscribe(
                (data: any) => {
                    this.groups = data;
                    //console.log('groups', this.groups)

                }
        )

        this.sur = this._fb.group({
            name: ['', [Validators.required]],
            description: [''],
            questions: this._fb.array([
                this.initQuestion(),
            ])
        });

    }

    initQuestion() {
        //console.log('initQuestion');
        return this._fb.group({
            name: ['', Validators.required],
            answers: this._fb.array([
                //this.initAnswer()
                this.initTemplateAnswer('')
            ])
        });
    }

    initAnswer() {
        //console.log('initAnswer');
        return this._fb.group({
            option: ['', Validators.required]
        })
    }

    initTemplateAnswer(t) {
        //console.log('initTemplateAnswer');
        return this._fb.group({
            option: [t, Validators.required]
        })
    }

    initTemplateAnswerGroup(t, count) {
        for (var i = 0; i < count; i++) {
            this.initTemplateAnswer(t);
        }
        
    }

    onSelect(question, group) {
        console.log('onSelect ', group);
        if (group != 0) {
            this.addOptions(question, group);
        }
    }

    addOptions(question, group): void {
        //console.log(question.value);
        var existingControls = <FormArray>question.controls.answers.controls;
        var count = existingControls.length;
        //console.log('count', count);

        const control = <FormArray>question.controls.answers;
        for (var i = 0; i < count; i++) {          
            control.removeAt(0);  //always remove index=0 as control index gets re-allocated on each iteration
            //console.log('removed', i);
        }

        // call api, loop through results:
        //var answerGroup = 85;

        this.apiSvc.fetchData(group)
            .subscribe(
                (data: any) =>
            {
                    this.stats = data;
               
                    //console.log('data', this.stats[0].answertext);
                    //console.log('count ', this.stats.length);
                    for (var i = 0; i < this.stats.length; i++) {
                        control.push(this.initTemplateAnswer(this.stats[i].answertext));
                    }
                    //console.log('question ', question.value);
                }
         )
    }

    addQuestion() {
        const control = <FormArray>this.sur.controls['questions'];
        control.push(this.initQuestion());
        console.log('addQuestion');
    }

    removeQuestion(i: number) {
        const control = <FormArray>this.sur.controls['questions'];
        control.removeAt(i);
    }

    addAnswer(question): void {
        const control = <FormArray>question.controls.answers;
        control.push(this.initAnswer());
    }

    removeAnswer(question, j: number) {
        const control = <FormArray>question.controls.answers;
        control.removeAt(j);
    }

    save(formData) {
        this.sessionGuid = Guid.create();

        this.apiService.postNewSurvey(formData.value, this.sessionGuid)
            .subscribe((data: any) => {
                this.survey = data
                //(error) => console.log(error);
                console.log(this.survey);
                this.router.navigateByUrl('/survey-create/survey-answer-template/' + this.survey);
            })

        //console.log(this.survey);
        //this.router.navigateByUrl('/summary-header');
        //this.router.navigateByUrl('/survey-create/survey-answer-template/' + this.survey);
    }
}
