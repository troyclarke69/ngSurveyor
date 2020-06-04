import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})

export class AuthenticationService {

    workspace = 'https://confident-hopper-e48455.busywork.ai';
    jsonHeader = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    isLoggedIn: boolean;

    constructor(private http: HttpClient, private router: Router) {
        this.isLoggedIn = false;
    }

    // try to get the access token
    getAccessToken() {
        return localStorage.getItem('user_access_token');
    }

    userLoggedIn(): boolean {
        return this.isLoggedIn;
    }

    signUp(username: string, password: string) {
        return this.http.post(
            this.workspace + '/sample-sign-up',
            // body content - required args can be seen in the Busywork function
            JSON.stringify({ 'username': username, 'password': password }),
            this.jsonHeader
        );
    }

    // sign in
    signIn(username: string, password: string) {
        return this.http.post(
            this.workspace + '/sample-sign-in',
            // body args
            { 'username': username, 'password': password }, this.jsonHeader)
            .subscribe(
                (result: any) => {
                    // console.log('result token ', result['data']['access_token']);
                    if (result['data']['access_token'] != undefined) {

                        this.isLoggedIn = true;
                        localStorage.setItem('user_access_token', result['data']['access_token']);
                        this.router.navigate(['user/profile']);
                        // console.log('localstorage ', this.getAccessToken());
                    } else {

                        this.router.navigate(['user/sign-in'], { queryParams: { msg: 'Login failed' } });
                    }
                }
            )
    }

    signOut() {
        // console.log('signOut ', this.getAccessToken());
        this.isLoggedIn = false;

        return this.http.post(
            this.workspace + '/sample-sign-out',
            {},
            this.jsonHeader
        ).subscribe(
            (result: any) => {
                this.router.navigate(['user/sign-in']);
            }
        )
    }

    // authenticate - checks if the users token is valid
    authenticate() {
        // console.log('authenticate', this.http.post(
        //   this.workspace + '/sample-authenticate',
        //   {},
        //   this.jsonHeader
        // ));

        return this.http.post(
            this.workspace + '/sample-authenticate',
            {},
            this.jsonHeader
        );

    }
}
