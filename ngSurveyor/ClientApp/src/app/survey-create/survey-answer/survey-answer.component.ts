import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import form_template from './form_sample';
import survey_sample from './survey_sample';

@Component({
    selector: 'app-survey-answer',
    templateUrl: './survey-answer.component.html',
    styleUrls: ['./survey-answer.component.css']
})

export class SurveyAnswerComponent implements OnInit {

    myFormGroup: FormGroup;
    formTemplate: any = form_template;

    constructor() { }

    ngOnInit() {
        let group = {}
        form_template.forEach(input_template => {
            group[input_template.label] = new FormControl('');
        })
        this.myFormGroup = new FormGroup(group);
    }

    onSubmit() {
        console.log(this.myFormGroup.value);
    }
}
