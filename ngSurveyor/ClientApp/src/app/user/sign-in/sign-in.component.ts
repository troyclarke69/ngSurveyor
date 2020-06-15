import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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

    auth2: any;
    @ViewChild('loginRef', { static: true }) loginElement: ElementRef;

    constructor(private fb: FormBuilder, private authService: AuthenticationService,
        private activatedRoute: ActivatedRoute, private route: Router) {

        this.form = this.fb.group({
            username: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required)
        });
    }

    ngOnInit() {
        this.googleSDK();
        this.fbLibrary();
         //console.log('sign-in OnInit');

        this.activatedRoute.queryParamMap
          .subscribe(params => {
              this.msg = params.get('msg');
              document.getElementById("failedLogin").innerHTML = this.msg;
        });
    }

    signUp() {
        //console.log('routed to signup');
        this.route.navigate(['user/sign-up']);
        //this.route.navigateByUrl("localhost:4200/user/sign-up");
    }

    signInUser() {
        this.authService.signIn(
            this.form.get('username').value,
            this.form.get('password').value
        );
    }

    prepareLoginButton() {
        this.auth2.attachClickHandler(this.loginElement.nativeElement, {},
            (googleUser) => {

                let profile = googleUser.getBasicProfile();
                //console.log('Token || ' + googleUser.getAuthResponse().id_token);
                //console.log('ID: ' + profile.getId());
                //console.log('Name: ' + profile.getName());
                //console.log('Image URL: ' + profile.getImageUrl());
                //console.log('Email: ' + profile.getEmail());

                // sign-in through app *busywork: username = email, password = Id
                this.authService.signIn(
                    profile.getEmail(),
                    profile.getId()
                );

            }, (error) => {
                alert(JSON.stringify(error, undefined, 2));
        });
        //console.log('signIN -- prepareLoginButton');
    }

    googleSDK() {

        window['googleSDKLoaded'] = () => {
            window['gapi'].load('auth2', () => {
                this.auth2 = window['gapi'].auth2.init({
                    client_id: '145597781537-ul759rrgdnqvck0k645hhclked274283.apps.googleusercontent.com',
                    cookiepolicy: 'single_host_origin',
                    scope: 'profile email'
                });
                this.prepareLoginButton();
            });
        }

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "https://apis.google.com/js/platform.js?onload=googleSDKLoaded";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'google-jssdk'));
    }

    fbLibrary() {

        (window as any).fbAsyncInit = function () {
            window['FB'].init({
                appId: '672363893323468',
                cookie: true,
                xfbml: true,
                version: 'v3.1'
            });
            window['FB'].AppEvents.logPageView();
        };

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

    }

    login() {

        window['FB'].login((response) => {
            console.log('login response', response);
            if (response.authResponse) {

                window['FB'].api('/me', {
                    fields: 'last_name, first_name, email'
                }, (userInfo) => {

                    // sign-in through app *busywork: username = email, password = Id
                    this.authService.signIn(
                        userInfo.email,
                        userInfo.id
                    );
                });

            } else {
                console.log('User login failed');
            }
        }, { scope: 'email' });
    }

}
