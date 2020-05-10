// NOTE: Must obtain API key to use this:
// https://developers.google.com/maps/documentation/javascript/get-api-key

import { Component, OnInit, Input } from '@angular/core';
import { GoogleMapService } from '../service/google-map.service';
import { ActivatedRoute } from '@angular/router';
//import { ChartData } from '../../chart-data'
import { Location } from '@angular/common';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit 
{
  private gLib: any;
  // private res = [];
  // public country: string;
  private stats = [];
  // private chart = [];
  // private chartCols = [];
  private chartRows = [];
  private chartRow = [];
  // public chartData: ChartData;

  // gChartService contains google charts lib ++ fetchData
  constructor( 
                private gChartService : GoogleMapService,
                private route: ActivatedRoute,
                private location: Location )   
  { 

    this.gLib = this.gChartService.getGoogle();
    this.gLib.charts.load("current", {"packages": ["map"]});
    // this.gLib.charts.setOnLoadCallback(this.drawChart.bind(this));
    this.gLib.charts.setOnLoadCallback(this.drawMain.bind(this));
  }

  // private drawChart()
  // {
  //   let data = this.gLib.visualization.arrayToDataTable(this.res);
  //   console.log('drawChart', data);
  //   var options = {
  //     title:'Daily Cases | Deaths | Recovered',
  //     legend:{position:'top-right'},
  //     chartArea:{width:'100%', height:'100%'},
  //     curveType: 'function',
  //    };
  //   let chart = new this.gLib.visualization.LineChart(document.getElementById('divLineChart'));
  //   chart.draw(data, options);
  // }

  private drawMain()
  {
    let data = new this.gLib.visualization.arrayToDataTable(this.chartRows);  
    console.log('drawMain', data);
    var options = {
      showToolTip: true,
      showInfoWindow: true
     };
    let chart = new this.gLib.visualization.Map(document.getElementById('divMapChart'));
    chart.draw(data, options);
  }

  ngOnInit(): void 
  {

    // this.route.paramMap.subscribe(params => {
    // 	this.country = params.get("country")  })
    // this.country = 'US';   
    // console.log('Param ', this.country);

    // TO DO: FIX HACK
    // Country names do not always resolve: e.g "USA" from list = "US" in chart, "UK" = "United Kingdom"
    // if (this.country == 'USA'){
    //   this.country = 'US';
    // }
    // if (this.country == 'UK'){
    //   this.country = 'United Kingdom';
    // }

    this.gChartService.fetchData().subscribe((data: any[])=>{ 
      this.stats = data;

      //This seems a bit of a hack, but couldn't figure out another workable method...
      //loop through all (c) country names, and when we get a match, set the stats obj to the data[c]
      // let keys = Object.keys(data);
      // for (var i=0; i < keys.length; i++) 
      // {
      //   if(this.country == keys[i])
      //   {
      //     this.stats = data[keys[i]];
      //   };
      // } 
      
      // push in the labels:
      this.chartRow.push('Country', 'Stats');
      this.chartRows.push(this.chartRow);

      // now push in the data:
      for(let s of this.stats)
      {
        let chartRow = [];
        chartRow.push(s.country, s.cases);
        this.chartRows.push(chartRow);
      }    
      console.log('chart', this.chartRows);
      this.drawMain(); 
    })       
  }
  
  goBack(): void {
    this.location.back();
  }

}
