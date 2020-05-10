import { Injectable } from '@angular/core';
import { ServiceModule } from './service.module';
import { HttpClient } from '@angular/common/http';

declare var google: any;

@Injectable({
  providedIn: ServiceModule
})

export class GoogleMapService {

  private google : any;

  private SERVER_URL = "https://corona.lmao.ninja/v2/countries?sort=cases"

  constructor(private httpClient: HttpClient) { 
    this.google = google;
  }

  getGoogle(){
    return this.google;
  }

  public fetchData(){
		
		console.log("GoogleMapService:fetchData");  
		return this.httpClient.get(`${this.SERVER_URL}`);  
  }  
  
}