import { Injectable } from '@angular/core';
import { ServiceModule } from './service.module';
import { HttpClient } from '@angular/common/http';

declare var google: any;

@Injectable({
  providedIn: ServiceModule
})
export class GoogleChartService {

  private google : any;

  //note: https://corona.lmao.ninja/countries?all is NOT the API link we want here,...
  // this line chart will detail country/region cases, deaths, etc ... this will be from different api call

  // private SERVER_URL = "https://corona.lmao.ninja/countries?all";

  // private SERVER_URL = "https://pomber.github.io/covid19/timeseries.json"

  private SERVER_URL = "https://troyclarke69.pythonanywhere.com/api/download"

  constructor(private httpClient: HttpClient) { 
    this.google = google;
  }

  getGoogle(){
    return this.google;
  }

  public fetchData(){
		
		console.log("GoogleChartService:fetchData");  
		return this.httpClient.get(`${this.SERVER_URL}`);  
  }  
  
}