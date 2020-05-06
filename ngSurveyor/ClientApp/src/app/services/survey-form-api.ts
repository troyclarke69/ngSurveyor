import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class ApiService {

    private SERVER_URL = "http://127.0.0.1:5000/pySurveyor/survey/entry?";
    private param: string;

    constructor(private httpClient: HttpClient) { }

    public fetchData(sessionId, qgroup) {

        this.param = "session=" + sessionId + "&qgroup=" + qgroup;

        console.log("APIService: survey-form-api.fetchData(s,q)");
        console.log(`${this.SERVER_URL}` + this.param);

        return this.httpClient.get(`${this.SERVER_URL}` + this.param);
    }
}
