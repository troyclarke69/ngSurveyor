import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/summary-header-api';

@Component({
    selector: 'app-summary-header',
    templateUrl: './summary-header.component.html',
    styleUrls: ['./summary-header.component.css']
})
export class SummaryHeaderComponent implements OnInit {

    stats = [];

    constructor(private apiService: ApiService) { }

    ngOnInit() {

        // Insert Session record
        this.apiService.fetchData().subscribe((data: any[]) => {
            console.log(data);
            this.stats = data;

        })
    }
}
