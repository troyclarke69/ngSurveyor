import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/summary-header-api';
import { AuthenticationService } from '../user/authentication.service';

@Component({
    selector: 'app-summary-header',
    templateUrl: './summary-header.component.html',
    styleUrls: ['./summary-header.component.css']
})
export class SummaryHeaderComponent implements OnInit {

    stats = [];
    isloggedIn: boolean;

    constructor(private apiService: ApiService) { }

    ngOnInit() {

        //this.isloggedIn = AuthenticationService.userLoggedIn();
        this.apiService.fetchData().subscribe((data: any[]) => {
            //console.log(data);
            this.stats = data;
        })
    }
}
