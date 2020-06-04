import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthenticationService } from "../authentication.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.css']
})

export class SignInComponent implements OnInit {
    msg: string;
    form: FormGroup;

    constructor(private fb: FormBuilder, private authService: AuthenticationService,
        private activatedRoute: ActivatedRoute) {

        this.form = this.fb.group({
            username: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required)
        });
    }

    ngOnInit() {
        // console.log('sign-in OnInit');

        this.activatedRoute.queryParamMap
            .subscribe(params => {
                this.msg = params.get('msg');
                document.getElementById("failedLogin").innerHTML = this.msg;
            });
    }

    private signInUser() {
        this.authService.signIn(
            this.form.get('username').value,
            this.form.get('password').value
        );
    }

}
