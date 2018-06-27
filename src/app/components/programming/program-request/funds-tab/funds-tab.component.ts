import { AutoValuesService } from './AutoValues.service';
import { FeedbackComponent } from './../../../feedback/feedback.component';
import { User } from './../../../../generated/model/user';
import { GlobalsService } from './../../../../services/globals.service';
import { PB } from './../../../../generated/model/pB';
import { ProgramViewComponent } from './../../../programs/program-view/program-view.component';
import { Component, Input, ApplicationRef, OnChanges, ViewChild, OnInit } from '@angular/core'
import { forkJoin } from "rxjs/observable/forkJoin"
import { Program, FundingLine, IntMap, UFR, POMService, Pom, PRService, PBService, ProgrammaticRequest, Tag, ProgramsService } from '../../../../generated'
import { Row } from './Row';
import { Key } from './Key';

@Component({
  selector: 'funds-tab',
  templateUrl: './funds-tab.component.html',
  styleUrls: ['./funds-tab.component.scss']
})
export class FundsTabComponent implements OnChanges, OnInit {
  @ViewChild(FeedbackComponent) feedback: FeedbackComponent;
  @Input() pr: ProgrammaticRequest;
  private pomFy: number;
  private pbFy: number;
  // key is appropriation+blin
  private rows: Map<string, Row> = new Map<string, Row>();
  
  // for the add FL section
  private appropriations: string[] = [];
  private appropriation: string;
  private blins: string[] = [];
  private blin: string;
  private item: string;
  private opAgencies: string[] = [];
  private opAgency: string;
  private programElement: string;

  constructor(private pomService: POMService,
              private pbService: PBService,
              private prService: PRService,
              private globalsService: GlobalsService,
              private initializerService: AutoValuesService ) {}

  async ngOnInit() {
    await this.loadDropdownOptions();
  }
  
  ngOnChanges() {
    if(!this.pr.phaseId) return; // the parent has not completed it's ngOnInit()
    this.initTable();
  }
  
  private initTable() {
    this.setPomFiscalYear();
    this.setPOMtoRows();
    this.setPBtoRows();
  }
  
  private async setPomFiscalYear() {
    const pom: Pom = (await this.pomService.getById(this.pr.phaseId).toPromise()).result;
    this.pomFy = pom.fy;
  }
  
  private async loadDropdownOptions() {
    {
      this.opAgencies = await this.globalsService.tagAbbreviationsForOpAgency();
      this.opAgency = this.opAgencies[0];
    }
    {
      this.appropriations = await this.globalsService.tagAbbreviationsForAppropriation();
      this.appropriation = this.appropriations[0];
    }
    {
      this.blins = await this.globalsService.tagAbbreviationsForBlin();
      this.blin = this.getInitiallySelectedBlins()[0];
      this.updateProgramElement();
    }
  }

  onBlinChange() {
    this.updateProgramElement();
  }

  onItemChange() {
    this.updateProgramElement();
  }

  async updateProgramElement() {
    this.programElement = await this.initializerService.programElement(this.blin, this.item);
  }
  
  private setPOMtoRows() {
    this.rows.clear();
    this.pr.fundingLines.forEach(fund => {
      var key = Key.create(fund.appropriation, fund.blin, fund.item, fund.opAgency);
      var prFunds: Map<number, number> = new Map<number, number>();
      var totalFunds: Map<number, number> = new Map<number, number>();
      var pbFunds: Map<number, number> = new Map<number, number>();
      Object.keys(fund.funds).forEach(function (yearstr) {
        var year: number = Number.parseInt(yearstr);
        prFunds.set(year, fund.funds[yearstr]);
        totalFunds.set(year, fund.funds[yearstr]);
        pbFunds.set(year, 0);
      });
      this.rows.set(key, {
        appropriation: fund.appropriation,
        blin: fund.blin,
        item: fund.item,
        opAgency: fund.opAgency,
        prFunds: prFunds,
        totalFunds: totalFunds,
        pbFunds: pbFunds
      });
    });
  }

  private async setPBtoRows() {
    const user: User = await this.globalsService.user().toPromise();
    const pb: PB = (await this.pbService.getLatest(user.currentCommunityId).toPromise()).result;
    this.pbFy = pb.fy;

    // there is no PB if there is no this.pr.originalMrId
    if(!this.pr.originalMrId) return;

    const pbPr: ProgrammaticRequest = (await this.prService.getByPhaseAndMrId(pb.id, this.pr.originalMrId).toPromise()).result;

    pbPr.fundingLines.forEach(fund => {
      var key = Key.create(fund.appropriation, fund.blin, fund.item, fund.opAgency);
      if (!this.rows.has(key)) {
        this.rows.set(key, {
          appropriation: fund.appropriation,
          blin: fund.blin,
          item: fund.item,
          opAgency: fund.opAgency,
          pbFunds: new Map(),
          prFunds: new Map(),
          totalFunds: new Map()
        });
      }
      var row: Row = this.rows.get(key);
      Object.keys(fund.funds).forEach(function (yearstr) {
        var year: number = Number.parseInt(yearstr);
        var amt: number = fund.funds[yearstr];
        row.pbFunds.set(year, amt);
        if (!row.prFunds.has(year)) {
          row.prFunds.set(year, 0);
        }
        row.totalFunds.set(year, row.prFunds.get(year) + amt);
      });
    });
  }

  addFundingLine() {
    var key: string = Key.create(this.appropriation, this.blin, this.item, this.opAgency);
    if (this.rows.has(key)) {
      this.feedback.failure('Funding Line already exists');
    } else {
      // now set this same data in the current data (for saves)
      var fundingLine: FundingLine = {
        fy: this.pomFy,
        appropriation: this.appropriation,
        blin: this.blin,
        item: this.item,
        opAgency: this.opAgency,
        programElement: this.programElement,
        funds: {},
        variants: []
      };
      this.pr.fundingLines.push(fundingLine);
      this.initTable();
    }
  }


  onedit(newval, appr, blin, year) {
    var thisyear:number = Number.parseInt(year);
    
    var thisvalue = Number.parseInt(newval.replace(/[^0-9]/g, ''));
    if (''===newval || Number.isNaN(thisvalue)) {
      thisvalue = 0;
    }

    var thisrow = this.rows.get(appr + blin);

    var oldvalue: number = (thisrow.prFunds.has(year) ? thisrow.prFunds.get(year) : 0);
    var oldtotal: number = (thisrow.totalFunds.has(year) ? thisrow.totalFunds.get(year) : 0);
    var newamt = oldtotal - oldvalue + thisvalue;
    thisrow.prFunds.set(year, thisvalue);
    thisrow.totalFunds.set(year, newamt);

    // finally, we need to update our actual funding lines...
    // BUT: we don't know if we have a funding line for this APPR+BLIN in this UFR
    var found = false;
    this.pr.fundingLines.forEach(fl => { 
      if (appr === fl.appropriation && blin === fl.blin) {
        fl.funds[year] = thisvalue;
        found = true;
      }
    });
    if (!found) {
      console.debug('no matching FL found...adding new one');
      var funds = {};
      funds[year] = thisvalue;

      this.pr.fundingLines.push({
        appropriation: appr,
        blin: blin,
        fy: this.pomFy,
        funds: funds,
        item: this.item,
        variants: []
      });
    }
  }

  // wierd algorithm for initial BLINs selection based on the initial this.appropriation selection. Possibly flawn.
  getInitiallySelectedBlins(): string[] {
    if ('PROC' === this.appropriation) return this.blins.filter(blin => (blin.match(/00/)));
    else if ('RDTE' === this.appropriation) return this.blins.filter(blin => (blin.match(/BA[1-4]/)));
    else if ('O&M' === this.appropriation) return this.blins.filter(blin => (blin.match(/BA[5-7]/)));
    else return this.blins;
  }



  totals(year: number, mode: string) {
    var sum: number = 0;
    this.rows.forEach(data => {
      if ('POM' === mode) {
        sum += (data.pbFunds.has(year) ? data.pbFunds.get(year) : 0);
      }
      else if ('UFR' === mode) {
        sum += (data.prFunds.has(year) ? data.prFunds.get(year) : 0 );
      }
      else if ('TOTAL' === mode) {
        sum += (data.totalFunds.get(year) ? data.totalFunds.get(year) : 0);
      }
    });

    return sum;
  }

}

