import { Component, OnInit, Input } from '@angular/core';
import { GoogleChartService } from '../service/google-chart.service';
import { ActivatedRoute } from '@angular/router';
//import { ChartData } from '../../chart-data'
import { Location } from '@angular/common';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})

export class LineChartComponent implements OnInit 
{
  // @Input() chartData: ChartData;

  private gLib: any;
  private res = [];
  public country: string;
  private stats = [];
  // private chart = [];
  // private chartCols = [];
  private chartRows = [];
  private chartRow = [];
  //public chartData: ChartData;

  // gChartService contains google charts lib ++ fetchData
  constructor( 
                private gChartService : GoogleChartService,
                private route: ActivatedRoute,
                private location: Location )   
  { 

    this.gLib = this.gChartService.getGoogle();
    this.gLib.charts.load('current', {'packages':['corechart','table']});
    // this.gLib.charts.setOnLoadCallback(this.drawChart.bind(this));
    this.gLib.charts.setOnLoadCallback(this.drawMain.bind(this));
  }

  private drawChart()
  {
    let data = this.gLib.visualization.arrayToDataTable(this.res);
    console.log('drawChart', data);
    var options = {
      title:'Daily Cases | Deaths | Recovered',
      legend:{position:'top-right'},
      chartArea:{width:'100%', height:'100%'},
      curveType: 'function',
     };
    let chart = new this.gLib.visualization.LineChart(document.getElementById('divLineChart'));
    chart.draw(data, options);
  }

  private drawMain()
  {
    let data = new this.gLib.visualization.arrayToDataTable(this.chartRows);  
    console.log('drawMain', data);
    var options = {
      title:'Daily Cases | Deaths | Recovered',
      //legend:{position:'bottom'},
      chartArea:{width: '50%', height:'50%'},
      curveType: 'function',
      vAxis: {
        scaleType: 'linear', //log or linear (default)
        viewWindowMode: 'explicit',
        viewWindow: {
          //max: 8000,
          min: 0,
        },
        gridlines: {
          count: 5,  //set kind of step (max-min)/count
        }
      }
     };
    let chart = new this.gLib.visualization.LineChart(document.getElementById('divLineChart'));
    chart.draw(data, options);
  }

  ngOnInit(): void 
  {
    //sample data: note that 1st line holds labels (column headers)
    // this.res = 
    // [
    //   ['Date', 'Cases', 'Deaths', 'Recovered'],
    //   ['2020-1-01',  1000,      400,   200],
    //   ['2020-1-02',  1170,      460,   400],
    //   ['2020-1-03',  660,       1120, 102],
    //   ['2020-1-04',  1030,      540,   222]
    // ];
    // console.log('res', this.res);

    this.route.paramMap.subscribe(params => {
    	this.country = params.get("country")  })
    // this.country = 'US';   
    // console.log('Param ', this.country);

    // TO DO: FIX HACK
    // Country names do not always resolve: e.g "USA" from list = "US" in chart, "UK" = "United Kingdom"
    if (this.country == 'USA'){
      this.country = 'US';
    }
    if (this.country == 'UK'){
      this.country = 'United Kingdom';
    }

    this.gChartService.fetchData().subscribe((data: any[])=>{ 			
      //This seems a bit of a hack, but couldn't figure out another workable method...
      //loop through all (c) country names, and when we get a match, set the stats obj to the data[c]
      let keys = Object.keys(data);
      for (var i=0; i < keys.length; i++) 
      {
        if(this.country == keys[i])
        {
          this.stats = data[keys[i]];
        };
      }   
      this.chartRow.push('Date', 'Confirmed', 'Recovered', 'Deaths');
      this.chartRows.push(this.chartRow);
      for(let s of this.stats)
      {
        let chartRow = [];
        chartRow.push(s.date, s.confirmed, s.recovered, s.deaths);
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
