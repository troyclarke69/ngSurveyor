import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Guid } from "guid-typescript";
import { ActivatedRoute, Router } from '@angular/router'
import { ApiService } from '../service/survey-create-api';

@Component({
    selector: 'app-survey-header',
    templateUrl: './survey-header.component.html',
    styleUrls: ['./survey-header.component.css']
})

export class SurveyHeaderComponent implements OnInit {

    public sur: FormGroup;
    public sessionGuid;
    public stats;

    constructor(private _fb: FormBuilder, private router: Router, private apiService: ApiService) { }

    ngOnInit() {
        this.sur = this._fb.group({
            name: ['', [Validators.required]],
            description: [''],
            questions: this._fb.array([
                this.initQuestion(),
            ])
        });
    }

    initQuestion() {
        return this._fb.group({
            name: ['', Validators.required],
            answers: this._fb.array([
                this.initAnswer()
            ])
        });
    }

    initAnswer() {
        return this._fb.group({
            option: ['', Validators.required]
        })
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
                this.stats = data
                    //(error) => console.log(error);
                //console.log(data);
            })

        this.router.navigateByUrl('/summary-header');    
    }
}
