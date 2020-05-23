import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceModule } from './service.module';

@Injectable({
    providedIn: ServiceModule
})

export class ApiService {

    private SURVEY_POST_URL = "http://127.0.0.1:5000/pysurveyor/survey/create?";
    private param: string;

    constructor(private httpClient: HttpClient) { }

    public postNewSurvey(data, sessionGuid) {

        //returns new surveyMasterId

        var data_json = JSON.stringify(data);
        this.param = "new=" + data_json + "&guid=" + sessionGuid;
        //console.log(`${this.SURVEY_POST_URL}` + this.param);

        return this.httpClient.get(`${this.SURVEY_POST_URL}` + this.param);
    }
}
