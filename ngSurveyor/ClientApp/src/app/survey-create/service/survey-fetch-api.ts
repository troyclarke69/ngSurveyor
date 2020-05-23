import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceModule } from './service.module';

@Injectable({
    providedIn: ServiceModule
})

export class ApiService {

    private SURVEY_FETCH_URL = "http://127.0.0.1:5000/pysurveyor/survey/schema?";
    private param: string;

    constructor(private httpClient: HttpClient) { }

    public fetchData(survey) {

        this.param = "survey=" + survey;
        //console.log(`${this.SURVEY_FETCH_URL}` + this.param);

        return this.httpClient.get(`${this.SURVEY_FETCH_URL}` + this.param);
    }
}
