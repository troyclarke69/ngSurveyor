import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class ApiService {

    //private SURVEY_GET_URL = "http://127.0.0.1:5000/pysurveyor/survey/entry?";
    //private RESULT_POST_URL = "http://127.0.0.1:5000/pysurveyor/result/post?";
    //private SESSION_POST_URL = "http://127.0.0.1:5000/pysurveyor/session/post?";

    private SURVEY_GET_URL = "https://troyclarke69.pythonanywhere.com/pysurveyor/survey/entry?";
    private RESULT_POST_URL = "https://troyclarke69.pythonanywhere.com/pysurveyor/result/post?";
    private SESSION_POST_URL = "https://troyclarke69.pythonanywhere.com/pysurveyor/session/post?";

    private param: string;

    constructor(private httpClient: HttpClient) { }

    public fetchData(sessionId, surveyId, qgroup) {

        this.param = "session=" + sessionId + "&survey=" + surveyId + "&qgroup=" + qgroup;
        //console.log("ApiService: survey-form-api.fetchData(s,q)");
        //console.log(`${this.SURVEY_GET_URL}` + this.param);

        return this.httpClient.get(`${this.SURVEY_GET_URL}` + this.param);
    }

    public postData(result, sessionId, surveyId) {
      
        var result_json = JSON.stringify(result);
        //console.log('result_json ', result_json);
        this.param = "result=" + result_json + "&session=" + sessionId + "&survey=" + surveyId;
        //console.log("ApiService: survey-form-api.postData(r,s)");
        //console.log(`${this.RESULT_POST_URL}` + this.param);

        return this.httpClient.get(`${this.RESULT_POST_URL}` + this.param);
    }

    public postSession(guid, surveyId) {

        this.param = "guid=" + guid + "&survey=" + surveyId;
        //console.log(`${this.SESSION_POST_URL}` + this.param);

        return this.httpClient.get(`${this.SESSION_POST_URL}` + this.param);
    }
}
