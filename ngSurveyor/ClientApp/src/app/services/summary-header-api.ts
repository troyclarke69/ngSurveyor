import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class ApiService {

    //private SERVER_URL = "http://127.0.0.1:5000/pysurveyor/summary"
    private SERVER_URL = "https://troyclarke69.pythonanywhere.com/pysurveyor/summary"

    constructor(private httpClient: HttpClient) { }

    public fetchData() {

        //console.log("coronaGlobalService:fetchData");
        return this.httpClient.get(`${this.SERVER_URL}`);
    }
}
