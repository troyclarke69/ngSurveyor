import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/survey-list-api';

@Component({
    selector: 'app-survey-list',
    templateUrl: './survey-list.component.html',
    styleUrls: ['./survey-list.component.css']
})
export class SurveyListComponent implements OnInit {

    stats = [];

    constructor(private apiService: ApiService) { }

    ngOnInit() {

        // Insert Session record
        this.apiService.fetchData().subscribe((data: any[]) => {
            //console.log(data);
            this.stats = data;

        })
    }
}
