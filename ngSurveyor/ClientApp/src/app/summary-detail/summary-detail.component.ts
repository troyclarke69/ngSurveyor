import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/summary-detail-api';
import { ActivatedRoute } from '@angular/router'
import { Location } from '@angular/common'

@Component({
    selector: 'app-summary-detail',
    templateUrl: './summary-detail.component.html',
    styleUrls: ['./summary-detail.component.css']
})
export class SummaryDetailComponent implements OnInit {

    stats = [];
    private survey;

    constructor(private apiService: ApiService,
                private route: ActivatedRoute,
                private location: Location) { }

    ngOnInit() {

        this.route.paramMap.subscribe(params => {
            this.survey = params.get("survey")
        })

        this.apiService.fetchData(this.survey)
            .subscribe((data: any[]) => {
              this.stats = data;

        })
    }
}
