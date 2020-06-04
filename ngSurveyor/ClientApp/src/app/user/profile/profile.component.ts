import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from "../authentication.service";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

    constructor(private authService: AuthenticationService) { }

    ngOnInit() {
        // console.log('profile');
    }

    signOutUser() {
        this.authService.signOut();
    }

}
