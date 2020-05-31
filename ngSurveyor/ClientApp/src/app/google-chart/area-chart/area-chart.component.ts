import { Component, OnInit, Input } from '@angular/core';
import { GoogleMapService } from '../service/google-map.service';
import { ActivatedRoute } from '@angular/router';
//import { ChartData } from '../../chart-data'
import { Location } from '@angular/common';

@Component({
  selector: 'app-area-chart',
  templateUrl: './area-chart.component.html',
  styleUrls: ['./area-chart.component.css']
})

export class AreaChartComponent implements OnInit 
{
  private gLib: any;
  private stats = [];
  private chartRows = [];
  private chartRow = [];

  // gChartService contains google charts lib ++ fetchData
  constructor( 
                private gChartService : GoogleMapService,
                private route: ActivatedRoute,
                private location: Location )   
  { 

    this.gLib = this.gChartService.getGoogle();
    this.gLib.charts.load("current", {"packages": ["corechart"]});
    // this.gLib.charts.setOnLoadCallback(this.drawChart.bind(this));
    this.gLib.charts.setOnLoadCallback(this.drawMain.bind(this));
  }

  private drawMain()
  {
    let data = new this.gLib.visualization.arrayToDataTable(this.chartRows);  
    //console.log('drawMain', data);
    var options = {
      title: '',
      hAxis: {title: 'Cases/Million'}, 
      vAxis: {title: 'Deaths/Million'},
      bubble: {textStyle: {fontSize: 10}}      
    };

    let chart = new this.gLib.visualization.BubbleChart(document.getElementById('divBubbleChart'));
    chart.draw(data, options);
  }

  ngOnInit(): void 
  {

    this.gChartService.fetchData().subscribe((data: any[])=>{ 
      this.stats = data;
      // console.log(this.stats);
      // push in the labels:
      this.chartRow.push('Country', 'Cases', 'Deaths', 'Tests');
      this.chartRows.push(this.chartRow);

      let counter = 1;
      let limit = 11;
      // now push in the data:
      for(let s of this.stats)
      {
        if(counter < limit){
          let chartRow = [];
          chartRow.push(s.country, s.casesPerOneMillion, s.deathsPerOneMillion, s.testsPerOneMillion);
          this.chartRows.push(chartRow);
          counter = counter + 1;
        }
      }    
      //console.log('chart', this.chartRows);
      this.drawMain(); 
    })       
  }
  
  goBack(): void {
    this.location.back();
  }

}
