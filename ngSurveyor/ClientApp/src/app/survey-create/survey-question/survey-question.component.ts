import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Guid } from "guid-typescript";
import { ActivatedRoute, Router } from '@angular/router'
import { ApiService } from '../service/survey-create-api';
import { ApiSvc } from '../service/survey-option-api';
import { ApiTemplate } from '../service/survey-fetch-api';

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
    public template = [];
    public survey;
    public surveyId;

    constructor(private _fb: FormBuilder, private router: Router, private route: ActivatedRoute,
        private apiService: ApiService, private apiSvc: ApiSvc, private apiTemplate: ApiTemplate) { }

    ngOnInit() {
        //console.log('ngOninit');
        this.route.paramMap.subscribe(params => {
            this.surveyId = params.get("survey")
        })

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

        this.apiTemplate.fetchData(this.surveyId)
            .subscribe(
                (data: any) => {
                    this.template = data;

                    if (this.template != null) {
                        this.addTemplate(this.sur['controls'].questions);
                    }
                }
            )
    }

    addTemplate(question): void {

        var controls = <FormArray>question['controls'];
        var count = controls.length;
        //console.log('question', count);

        const control = <FormArray>question;
        for (var r = 0; r < count; r++) {
            control.removeAt(0); 
        }

        for (var i = 0; i < this.template['questions'].length; i++) {
            control.push(this.initTemplateQuestion(this.template['questions'][i]['name'],
                this.template['questions'][i]['type']));

            // after initTemplateQuestion - must delete the auto-generated option * should only be one here
            var options = <FormArray>this.sur.controls.questions['controls'][i]['controls']['answers'];
            options.removeAt(0);                    

            for (var j = 0; j < this.template['questions'][i]['answers'].length; j++) {
                options.push(this.initTemplateAnswer(this.template['questions'][i]['answers'][j]['option']));
                //console.log(this.template['questions'][i]['answers'][j]['option']);
               
            }
        }
    }

    initTemplateQuestion(_name, _type) {
        //console.log('initQuestion');
        return this._fb.group({
            name: [_name, Validators.required],
            type: [_type],
            answers: this._fb.array([
                //this.initAnswer()
                this.initTemplateAnswer('')
            ])
        });
    }

    initQuestion() {
        //console.log('initQuestion');
        return this._fb.group({
            name: ['', Validators.required],
            type: ['Dropdown'],
            answers: this._fb.array([
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
        if (group != 0) {
            this.addOptions(question, group);
        }
    }

    addOptions(question, group): void {
 
        var existingControls = <FormArray>question.controls.answers.controls;
        var count = existingControls.length;

        const control = <FormArray>question.controls.answers;
        for (var i = 0; i < count; i++) {          
            control.removeAt(0);  //always remove index=0 as control index gets re-allocated on each iteration
        }

         this.apiSvc.fetchData(group)
            .subscribe(
                (data: any) =>
                {
                    this.stats = data;         
                    for (var i = 0; i < this.stats.length; i++) {
                        control.push(this.initTemplateAnswer(this.stats[i].answertext));
                    }
                }
         )
    }

    addQuestion() {
        const control = <FormArray>this.sur.controls['questions'];
        control.push(this.initQuestion());
        //console.log('addQuestion');
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
        //console.log(this.sessionGuid);

        this.apiService.postNewSurvey(formData.value, this.sessionGuid)
            .subscribe((data: any) => {
                this.survey = data
                //(error) => console.log(error);
                //console.log(this.survey);
                this.router.navigateByUrl('/survey-create/survey-answer-template/' + this.survey);
            })
    }
}
