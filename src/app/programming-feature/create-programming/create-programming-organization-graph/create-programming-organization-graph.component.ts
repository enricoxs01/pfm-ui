import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pfm-programming-organization-graph',
  templateUrl: './create-programming-organization-graph.component.html',
  styleUrls: ['./create-programming-organization-graph.component.scss']
})
export class CreateProgrammingOrganizationGraphComponent{

  @Input() griddata:any[];
  chartReady:boolean;

  public columnChart: any =  {
    chartType: 'ColumnChart',
    dataTable: [
      ['Fiscal Year', 'PRs Submitted', 'PRs Planned', 'TOA Difference', 'Unallocated'],
      ['FY16', 350001, 200001, 100000, 10000],
      ['FY17', 400001, 300001, 150000, 200000],
      ['FY18', 250001, 400001, 40000, 300000],
      ['FY19', 650001, 6000, 300000, 100000],
      ['FY20', 500001, 70000, 100000, 50000],
      ['FY21', 600000, 200001, 200000, 300000]
    ],
    options: {
      title: 'Community TOA',
      width: 200,
      height: 200,
      isStacked: true,
      legend: {position: 'top', maxLines: 2},
      animation: {
        duration: 500,
        easing: 'out',
        startup: true
      }
    }
  };

  constructor() { }

  ngOnInit() {
  }

  onResize(width:number, height:number):void{
    this.chartReady = false;

    this.columnChart.options.width = width;
    this.columnChart.options.height = height;

    setTimeout(()=>{
      this.chartReady = true;

    }, 200);
  }
}
