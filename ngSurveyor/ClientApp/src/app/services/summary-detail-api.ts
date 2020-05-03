import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class ApiService {

    private SERVER_URL = "http://127.0.0.1:5000/pySurveyor/Survey?survey=";


    constructor(private httpClient: HttpClient) { }

    public fetchData(id) {

        //console.log("coronaGlobalService:fetchData");
        return this.httpClient.get(`${this.SERVER_URL}` + id);
    }
}
