import { UserUtils } from '../../../../services/user.utils';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridNg2 } from "ag-grid-angular";
import { ProgramsService, OrganizationService, Organization, User, Program, UFRsService, UFR, UFRFilter } from '../../../../generated';
import { DatePipe } from "@angular/common";
import { ProgramRequestWithFullName, ProgramWithFullName, WithFullNameService } from "../../../../services/with-full-name.service";
import { SimpleLinkCellRendererComponent, SimpleLink } from '../../../renderers/simple-link-cell-renderer/simple-link-cell-renderer.component';

@Component({
  selector: 'all-ufrs',
  templateUrl: './all-ufrs.component.html',
  styleUrls: ['./all-ufrs.component.scss']
})
export class AllUfrsComponent implements OnInit {

  @Input() private mapCycleIdToFy: Map<string, string>;

  private mapProgrammyIdToFullName: Map<string, string>;// mrid, fullname
  private user: User;
  private orgMap: any[] = []
  datePipe: DatePipe = new DatePipe('en-US')
  private filtertext;
 
  // agGrid   
  @ViewChild("agGrid") private agGrid: AgGridNg2;
  private rowData: any[];
  private colDefs;
  private menuTabs = ['filterMenuTab'];

  private frameworkComponents:any = {
    simpleLinkCellRendererComponent: SimpleLinkCellRendererComponent
  };

  // private context: any = {
  //   route: '/ufr-view'
  // } 

  constructor( private ufrsService: UFRsService,
               private userUtils: UserUtils,
               private programsService: ProgramsService,
               private orgSvc: OrganizationService,
               private router: Router,
               private withFullNameService: WithFullNameService) {}

  async ngOnInit() {

    this.user = await this.userUtils.user().toPromise();
    const programs: Program[] = (await this.programsService.getAll().toPromise()).result;
    await this.initProgrammyIdToFullName(programs);

    let organizations: Organization[] = (await this.orgSvc.getByCommunityId(this.user.currentCommunityId).toPromise()).result;
    organizations.forEach(org => {
      this.orgMap[org.id] = org.abbreviation;
    });

    this.setAgGridColDefs();
    this.populateRowData();
    setTimeout(() => {
      this.agGrid.api.sizeColumnsToFit()
    });
  }

  private setAgGridColDefs(): any {

    let colKeys: string[] = ["UFR #", "UFR Name", "Prog Id", "Status", "Priority", "Disposition",
      "Last Updated", "Funding Request", "Func Area", "Organization"];

    this.colDefs = [];

    colKeys.forEach(colKey => {
      let coldef;

      switch (colKey) {
        case ("UFR #"):
          coldef = {
            headerName: colKey,
            field: colKey,
            width: 102,
            editable: false,
            cellRenderer: 'simpleLinkCellRendererComponent',
            menuTabs: this.menuTabs,
            filter: 'agTextColumnFilter',
            getQuickFilterText: params =>  {
              return params.value.linktext;
            },
            comparator: this.ufrCompare
          }
          break;
        case ("Last Updated"):
          coldef = {
            headerName: colKey,
            field: colKey,
            width: 102,
            editable: false,
            cellRenderer: params => this.dateFormatter(params.value),
            menuTabs: this.menuTabs,
            filter: 'agDateColumnFilter',
          }
          break;
        case ("Func Area"):
        case ("Organization"):
          coldef = {
            headerName: colKey,
            field: colKey,
            width: 102,
            hide: true,
            editable: false,
            menuTabs: this.menuTabs,
            filter: 'agTextColumnFilter',
          }
          break;  
        default:
          coldef = {
            headerName: colKey,
            field: colKey,
            width: 102,
            editable: false,
            menuTabs: this.menuTabs,
            filter: 'agTextColumnFilter',
          }
          break;
      }
      this.colDefs.push(coldef);
    });
  }

  private onGridReady(params) {
    params.api.sizeColumnsToFit();
    window.addEventListener("resize", function () {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }

  private ufrCompare(param1, param2){
    return param1.linktext.localeCompare( param2.linktext );
  }

  private async populateRowData() {

    const ufrFilter: UFRFilter = {};
    let ufrs: UFR[] = (await this.ufrsService.search(this.user.currentCommunityId, ufrFilter).toPromise()).result;

    let alldata: any[] = [];
    ufrs.forEach(ufr => {

      let row = {
        "UFR #": new SimpleLink( "/ufr-view/"+ufr.id, this.ufrNumber(ufr) ),
        "UFR Name": ufr.shortName,
        "Prog Id": this.mapProgrammyIdToFullName.get(ufr.shortyId),
        "Status": ufr.status,
        "Priority": ufr.priority,
        "Disposition": ufr.disposition,
        "Last Updated": ufr.lastMod,
        "Funding Request": "",
        "Func Area": ufr.functionalArea,
        "Organization": this.orgMap[ufr.organization]
      }
      alldata.push(row);
    });
    this.rowData = alldata;
  }

  private dateFormatter(longdate) {
    let dateFormat = 'MM/dd/yyyy hh:mm:ss a';
    return this.datePipe.transform(new Date(longdate), dateFormat);
  }

  private async initProgrammyIdToFullName(programs: Program[]): Promise<any> {
    return new Promise( async (resolve) => {
      // TODO: make the following two calls in parallel
      this.mapProgrammyIdToFullName = new Map<string, string>();
      (await this.withFullNameService.programs()).forEach((program: ProgramWithFullName) => {
        this.mapProgrammyIdToFullName.set(program.id, program.fullname);
      });
      (await this.withFullNameService.allProgramRequestsWithFullNamesDerivedFromCreationTimeData()).forEach((pr: ProgramRequestWithFullName) => {
        this.mapProgrammyIdToFullName.set(pr.id, pr.fullname);
      });
      resolve();
    });
  }

  private ufrNumber(ufr: UFR): string {
    const fullFy = +this.mapCycleIdToFy.get(ufr.phaseId).slice(-4); // the value stored in this.mapCycleIdToFy look like this: 'POM 2017'
    const shortFy = fullFy - 2000;
    const sequentialNumber = ('000' + ufr.requestNumber).slice(-3);
    return shortFy + sequentialNumber;
  }

  private onFilterTextBoxChanged() {    
    this.agGrid.gridOptions.api.setQuickFilter( this.filtertext );
  }

  onToolPanelVisibleChanged(params) {
    this.agGrid.api.sizeColumnsToFit();
  }

  onColumnVisible(params) {
    this.agGrid.api.sizeColumnsToFit();
  }

}
