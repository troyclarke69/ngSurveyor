import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientHelper } from './base-url-helper';

@Injectable({
    providedIn: 'root'
})

export class ApiService {

    //private SERVER_URL = "http://127.0.0.1:5000/pysurveyor/survey?";
    //private SERVER_URL = "https://troyclarke69.pythonanywhere.com/pysurveyor/survey?";

    private path = 'survey?';

    private param: string;

    constructor(private httpClient: HttpClient) { }

    public fetchData(surveyId, sessionId) {

        this.param = "survey=" + surveyId + "&session=" + sessionId;
        //console.log("coronaGlobalService:fetchData");
        //return this.httpClient.get(`${this.SERVER_URL}` + this.param);
        return this.httpClient.get(`${HttpClientHelper.baseURL}` + this.path + this.param);
    }
}
