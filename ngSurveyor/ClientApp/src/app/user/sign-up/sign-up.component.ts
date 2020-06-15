import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthenticationService } from "../authentication.service";
import { Router } from "@angular/router";

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.css']
})

export class SignUpComponent implements OnInit {

    form: FormGroup;
    auth2: any;
    @ViewChild('loginG', { static: true }) loginElem: ElementRef;

    constructor(private fb: FormBuilder, private authService: AuthenticationService,
                  private router: Router, private ngZone: NgZone) {

        this.form = this.fb.group({
            username: new FormControl('', Validators.compose([Validators.required, Validators.minLength(3)])),
            password: new FormControl('', Validators.compose([Validators.required, Validators.minLength(6)]))
        });
    }

    ngOnInit() {
        this.google();
        this.fbLibrary();
    }

    // Sign-up with username/password (button click)
    signUpUser() {
        this.authService.signUp(
            this.form.get('username').value,
            this.form.get('password').value
        ).subscribe(
            (result: any) => {
                //console.log(result);
                if (result['status'] == 'success') {
                    this.form.reset();
                    this.router.navigate(['user/sign-in']);
                } else {
                    alert("Sign Up " + result['status'] + ' - '
                        + result['message'] + ' (status code: ' + result['status_code'] + ')');
                }
            }
        )
    }

    // GOOGLE
    prepareLoginButton() {

        this.auth2.attachClickHandler(this.loginElem.nativeElement, {},
            (googleUser) => {

                let profile = googleUser.getBasicProfile();

                // sign-in through app *busywork: username = email, password = Id
                this.authService.signUp(profile.getEmail(), profile.getId()).subscribe(
                    (result: any) => {
                        if (result['status'] == 'success') {
                            this.ngZone.run(() => {
                                this.router.navigate(['summary-header'])
                            });
                        } else {
                            alert("Sign Up " + result['status'] + ' - '
                                + result['message'] + ' (status code: ' + result['status_code'] + ')');
                        }
                    }
                )

            }, (error) => {
                alert(JSON.stringify(error, undefined, 2));
        });
        //console.log('signUP -- prepareLoginButton');
    }

    google() {
        window['googleSDKLoaded'] = () => {
            window['gapi'].load('auth2', () => {
                this.auth2 = window['gapi'].auth2.init({
                    client_id: '145597781537-drhn51tf1867fjl4a745o4ktjce7gfh4.apps.googleusercontent.com',
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

    // FACEBOOK
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
            //console.log('login response', response);
            if (response.authResponse) {

                window['FB'].api('/me', {
                    fields: 'last_name, first_name, email'
                }, (userInfo) => {

                    // sign-in through app *busywork: username = email, password = Id
                    this.authService.signUp(userInfo.email, userInfo.id).subscribe(
                        (result: any) => {
                            //console.log(result);

                            if (result['status'] == 'success') {
                                this.ngZone.run(() => {
                                    this.router.navigate(['summary-header'])
                                });
                            } else {
                                alert("Sign Up " + result['status'] + ' - '
                                    + result['message'] + ' (status code: ' + result['status_code'] + ')');
                            }
                        }
                    )
                });

            } else {
                console.log('User login failed');
            }
        }, { scope: 'email' });
    }

}
