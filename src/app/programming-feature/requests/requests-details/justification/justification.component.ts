import { Component, OnInit, ViewChild, HostListener, Input } from '@angular/core';
import { GoogleChartComponent } from 'ng2-google-charts';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { ProgrammingService } from 'src/app/programming-feature/services/programming-service';
import { Program } from 'src/app/programming-feature/models/Program';

@Component({
  selector: 'pfm-justification',
  templateUrl: './justification.component.html',
  styleUrls: ['./justification.component.scss']
})
export class JustificationComponent implements OnInit {

  static MAX_YEAR = 5;

  @ViewChild('googleChart', { static: false })
  chart: GoogleChartComponent;

  @Input() pomYear: number;
  @Input() program: Program;

  chartData: GoogleChartInterface = {
    chartType: 'ColumnChart',
    options: {
      titlePosition: 'none',
      width: 800,
      height: 350,
      series: {
        0: {
          type: 'line'
        },
        1: {
          type: 'line'
        },
        2: {
          type: 'line',
          color: '#000',
          visibleInLegend: false,
          lineWidth: 0,
          enableInteractivity: false
        }
      },
      vAxis: {
        format: '$#,###',
        gridlines: {
          count: 10
        },
      },
      animation: {
        duration: 500,
        easing: 'out',
        startup: true
      },
    }
  };

  boundData = [];

  programmingPreviousYear = [];

  programmingCurrentYear = [];

  constructor(
    private programmingService: ProgrammingService
  ) { }

  async ngOnInit() {
    await this.loadPom();
    this.drawLineChart(true);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    if (this.chart) {
      this.chart.draw();
    }
  }

  onChartReady(event: any) {
  }

  drawLineChart(redraw?: boolean) {
    const data: any[] = [
      [
        'Fiscal Year',
        'POM' + (this.pomYear % 100 - 1),
        'POM' + (this.pomYear % 100),
        ''
      ]
    ];
    this.fillBoundData();
    for (let i = 0; i < JustificationComponent.MAX_YEAR; i++) {
      data.push([
        'FY' + (this.pomYear % 100 + i),
        i === JustificationComponent.MAX_YEAR - 1 ? null : this.programmingPreviousYear[i] || 0,
        this.programmingCurrentYear[i] || 0,
        this.boundData[i]
      ]);
    }

    this.chartData.dataTable = data;
    if (this.chart && this.chart.wrapper && redraw) {
      this.chart.draw();
    }
  }

  fillBoundData() {
    this.boundData = [];
    let maxPrev = 0;
    let minPrev = 0;
    if (this.programmingPreviousYear.length) {
      maxPrev = Math.max.apply(Math, this.programmingPreviousYear.map(fund => fund));
      minPrev = Math.min.apply(Math, this.programmingPreviousYear.map(fund => fund));
    }
    let maxCurr = 0;
    let minCurr = 0;
    if (this.programmingCurrentYear.length) {
      maxCurr = Math.max.apply(Math, this.programmingCurrentYear.map(fund => fund));
      minCurr = Math.min.apply(Math, this.programmingCurrentYear.map(fund => fund));
    }
    const max = (maxPrev > maxCurr ? maxPrev : maxCurr) + 10000;
    const min = (minPrev > minCurr ? minPrev : minCurr) - 10000;
    this.boundData.push(max);
    this.boundData.push(min);
    for (let i = 0; i < JustificationComponent.MAX_YEAR - 2; i++) {
      this.boundData.push(0);
    }
  }

  async loadPom() {
    return new Promise(async resolve => {
      await this.waitForProgrammingPreviousYear();
      this.programmingCurrentYear = [];
      for (let i = this.pomYear; i < this.pomYear + JustificationComponent.MAX_YEAR; i++) {
        const fund = this.program.fundingLines[i];
        this.programmingCurrentYear[this.programmingCurrentYear.length] = fund;
      }
      resolve('');
    });
  }

  waitForProgrammingPreviousYear() {
    return new Promise(resolve => {
      this.programmingService.getPRForYearAndShortName(this.pomYear - 1, this.program.shortName)
        .subscribe(resp => {
          this.loadFundingData(resp.result.fundingLines, this.programmingPreviousYear);
          resolve('');
        }, err => {
          this.programmingPreviousYear = [];
        });
    });
  }

  private loadFundingData(fundingLines: any[], programmingYear: any[]) {
    for (let year = this.pomYear; year < this.pomYear + JustificationComponent.MAX_YEAR; year++) {
      let funds = 0;
      for (const fundingLine of fundingLines) {
        funds += fundingLine.funds[year] || 0;
      }
      programmingYear[programmingYear.length] = funds;
    }
  }

}
