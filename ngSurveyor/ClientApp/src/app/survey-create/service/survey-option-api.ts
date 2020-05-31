import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceModule } from './service.module';
import { HttpClientHelper } from '../../services/base-url-helper';

@Injectable({
    providedIn: ServiceModule
})

export class ApiSvc
{

    //private OPTION_FETCH_URL = "http://127.0.0.1:5000/pysurveyor/survey/options?";
    //private GROUP_FETCH_URL = "http://127.0.0.1:5000/pysurveyor/survey/groups";
    private option_path = 'survey/options?';
    private group_path = 'survey/groups?';
    private param: string;

    constructor(private httpClient: HttpClient) { }

    public fetchGroups() {

        //this.param = '';
        //console.log(`${this.SURVEY_FETCH_URL}` + this.param);

        //return this.httpClient.get(`${this.OPTION_FETCH_URL}` + this.param);
        //return this.httpClient.get(`${this.GROUP_FETCH_URL}`);
        return this.httpClient.get(`${HttpClientHelper.baseURL}` + this.group_path);
    }  

    public fetchData(group) {

        this.param = "group=" + group;
        //console.log(`${this.SURVEY_FETCH_URL}` + this.param);

        //return this.httpClient.get(`${this.OPTION_FETCH_URL}` + this.param);
        return this.httpClient.get(`${HttpClientHelper.baseURL}` + this.option_path + this.param);
    }  
}
