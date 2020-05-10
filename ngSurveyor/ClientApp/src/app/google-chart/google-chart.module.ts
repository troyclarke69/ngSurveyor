import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceModule } from './service/service.module';
import { LineChartComponent } from './line-chart/line-chart.component';
import { MapComponent } from './map/map.component';
import { AreaChartComponent } from './area-chart/area-chart.component';

@NgModule({
  declarations: [LineChartComponent, MapComponent, AreaChartComponent],
  imports: [
    CommonModule,
    ServiceModule
  ],
  exports: [LineChartComponent],
  providers : []
})
export class GoogleChartModule { }
