import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {PomService} from '../../programming-feature/services/pom-service';
import {DialogService} from '../../pfm-coreui/services/dialog.service';
import {ListItem} from '../../pfm-common-models/ListItem';
import {DropdownComponent} from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import {Router} from '@angular/router';
import {FormatterUtil} from '../../util/formatterUtil';
import {FileMetaData} from '../../pfm-common-models/FileMetaData';
import {Attachment} from '../../pfm-common-models/Attachment';
import {ColumnApi, GridApi} from '@ag-grid-community/all-modules';
import {AppModel} from '../../pfm-common-models/AppModel';
import {ActionCellRendererComponent} from '../../pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import {Action} from '../../pfm-common-models/Action';
import {TOA} from '../models/TOA';
import {Pom} from '../models/Pom';
import {PomServiceResponse} from '../models/PomServiceResponse';
import {Organization} from '../../pfm-common-models/Organization';
import {OrganizationService} from '../services/organization-service';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { RequestsSummaryToaWidgetComponent } from '../requests/requests-summary-toa-widget/requests-summary-toa-widget.component';
import { CreateProgrammingCommunityGraphComponent } from './create-programming-community-graph/create-programming-community-graph.component';
import { ProgramRequestForPOM } from '../models/ProgramRequestForPOM';
import { DashboardMockService } from '../../pfm-dashboard-module/services/dashboard.mock.service';
import { RequestsSummaryOrgWidgetComponent } from '../requests/requests-summary-org-widget/requests-summary-org-widget.component';
import { DataGridMessage } from '../../pfm-coreui/models/DataGridMessage';
import { CreateProgrammingOrganizationGraphComponent } from './create-programming-organization-graph/create-programming-organization-graph.component';

@Component({
  selector: 'pfm-programming',
  templateUrl: './create-programming.component.html',
  styleUrls: ['./create-programming.component.css']
})
export class CreateProgrammingComponent implements OnInit {
  @ViewChild(DropdownComponent, {static: false}) yearDropDown: DropdownComponent;
  
  @ViewChild('communityGraphItem',  {static: false}) communityGraphItem: ElementRef;
  @ViewChild(CreateProgrammingCommunityGraphComponent,  {static: false}) communityGraph: CreateProgrammingCommunityGraphComponent;
  @ViewChild('organizationGraphItem',  {static: false}) organizationGraphItem: ElementRef;
  @ViewChild(CreateProgrammingOrganizationGraphComponent,  {static: false}) organizationGraph: CreateProgrammingOrganizationGraphComponent;

  id:string = 'create-programming-component';
  busy:boolean;
  availableYears:ListItem[];
  selectedYear:string;
  byYear:any;
  programYearSelected:any;
  showUploadDialog:boolean;
  programBudgetData:boolean;
  communityGridApi:GridApi;
  orgGridApi:GridApi;
  commColumnApi:ColumnApi;  
  orgColumnApi:ColumnApi; 
  communityColumns:any[]; 
  communityData:any[];
  orgColumns:any[];
  orgData:any[];
  subToasData:any[];
  tableHeaders:Array<string>;  
  orgs:Array<Organization>;
  uploadedFileId:string;
  communityOptions: GridsterConfig;
  communityDashboard: Array<GridsterItem>;
  communityGridData:any[];
  organizationOptions: GridsterConfig;
  organizationDashboard: Array<GridsterItem>;
  organizationGridData:any[];
  loadBaseline:boolean;
  constructor(private appModel: AppModel, private organizationService: OrganizationService, private pomService: PomService, private dialogService: DialogService, private router: Router, private dashboardService: DashboardMockService) {
 
    //var selectedYear = appModel.selectedYear;   
    this.subToasData = [];

    organizationService.getAll().subscribe(
      resp => {
                this.orgs = (resp as any).result;               
              },
      error => {
          this.orgs = [];
          console.log(error);
      });
  }

  yearSelected(year:string):void{
    this.selectedYear = year;
    console.log("selected year "+ this.programYearSelected);
    
    this.loadBaseline = false;
    if (this.programYearSelected != "undefined") {
      this.dialogService.displayConfirmation("You are about to replace the baseline with different values.  All values in the community and organization grid will be reset.  Do you want to continue?","Caution",
          () => { 
            this.loadBaseline = true;
            this.onSelectBaseLine();
          }, () => {
            this.loadBaseline = false;
            this.yearDropDown.selectedItem = this.programYearSelected;
          });
    }else {
      this.loadBaseline = true;
    }
    
    if (this.loadBaseline) {
      this.onSelectBaseLine();
    }
    
   }
  
   onSelectBaseLine(){
    this.programYearSelected= Object.keys( this.selectedYear).map(key =>  this.selectedYear[key]).slice(0,1);
      console.log("selected year "+ this.programYearSelected);    
      if(this.programYearSelected=="Spreadsheet"){
        this.showUploadDialog = true;
      }else{ // if it is PBYear 
        this.showUploadDialog = false;
        this.programBudgetData=true;
        
        var selectedYear = this.byYear;///FormatterUtil.getCurrentFiscalYear()+1; 
        this.initGrids(selectedYear);
        this.getPomFromPB(selectedYear);
      }
   }

   initGrids(selectedYear){
     // set the column definitions to community adn Organization grid
     this.communityColumns =   this.setAgGridColDefs("Community",selectedYear);
     this.orgColumns = this.setAgGridColDefs("Organization",selectedYear);                    
   }

   getPomFromPB(selectedYear:any){
    this.busy = true;
      this.pomService.getPomFromPb().subscribe(
        resp => {
          this.busy = false;
          var pom = (resp as PomServiceResponse).result ;
          console.log("year..." + pom.fy);
          this.loadGrids(pom,selectedYear);
      },
      error => {
        this.busy = false;
          console.log("Error in getting community and org toas...");
        // this.busy = false;
      });
   }
   
   loadGrids(pomData:Pom,fy:number){
      let toarow = {};            
      let subtoarow = {};
      this.subToasData = []; 

      this.communityData = [];
      this.orgData = [];

      // BaseLine
      let row = {}
      row["orgid"] = "<strong><span>Baseline</span></strong>";
      pomData.communityToas.forEach(toa => {
        row[toa.year] = toa.amount;
      });
      
      let  actions = new Action();
      actions.canDelete = false;
      actions.canEdit = true;
      actions.canSave = false;
      actions.canUpload = false;

      //row["actions"] = actions;
      this.communityData.push(row);

      // Community Toas
      row = {}      
      row["orgid"] = "<strong><span>TOA</span></strong>";
      toarow['orgid'] = "<strong><span>sub TOA Total Goal</span></strong>";
      pomData.communityToas.forEach((toa: TOA) => {
        row[toa.year] = toa.amount;        
      });
      
      let i:number;
      for (i = 0; i < 5; i++) {         
        if ( row[ fy+i ] == undefined ) row[ fy+i ] = 0;

        toarow[fy+i] = row[ fy+i ] ;
      }      
      row["actions"] = actions;
      this.communityData.push(row);

      toarow['orgid'] = "sub TOA Total Goal";
      this.subToasData.push(toarow);
      
      this.communityData.forEach( row => {        
        for (i = 0; i < 5; i++) {
          if ( row[ fy+i ] == undefined ) {
            row[ fy+i ] = 0;
            }          
          }       
        });
                
    //  this.communityGridApi.setRowData(this.communityData);
    //  this.communityGridApi.setColumnDefs(this.communityColumns);

      // Org TOAs      
     Object.keys(pomData.orgToas).reverse().forEach(key => {          
          row = {};          
          row['orgid'] = "<strong><span>" + this.getOrgName(key) +"</span></strong>";
          pomData.orgToas[key].forEach( (toa:TOA) => {
            row[toa.year] = toa.amount;          
           });

        row["actions"] = actions;
        this.orgData.push(row);     
      });
      
      this.orgData.forEach( row => {        
      for (i = 0; i < 5; i++) {
        if ( row[ fy+i ] == undefined ) {
          row[ fy+i ] = 0;
          }          
        }       
      });      

      subtoarow = {};
      subtoarow['orgid'] = "<strong><span>sub-TOA Total Actual</span></strong>";
      for (i = 0; i < 5; i++) {
        let total = 0;        
        this.orgData.forEach(row => {
          if ( row[ fy+i ] == undefined ) {
            row[ fy+i ] = 0;
            }
          total = total + row[fy+i];
        });
        subtoarow[fy+i] = total;
      }

      //let rowspan = {};
      //rowspan['orgid'] ="";
      this.tableHeaders = [];
      this.tableHeaders.push('orgid');
      for (i = 0; i < 5; i++){
       // rowspan[fy+ i] =  "";
        this.tableHeaders.push((fy+i).toString());
      }

      //this.orgData.push(rowspan);
      this.orgData.push(toarow);      
      this.orgData.push(subtoarow);

      subtoarow['orgid'] = "sub-TOA Total Actual";
      this.subToasData.push(subtoarow);

      let toaDeltarow = {};
      toaDeltarow['orgid'] = "<strong><span>Delta</span></strong>";
      for (i = 0; i < 5; i++)
      {        
        toaDeltarow[fy+i] = subtoarow[fy+i] - toarow[fy+i];
      }
      
      this.orgData.push(toaDeltarow);
      toaDeltarow['orgid'] = "Delta";
      this.subToasData.push(toaDeltarow);

     // this.orgGridApi.setRowData(this.orgData);
     // this.orgGridApi.setColumnDefs(this.orgColumns);
     this.updateCommunityGraphData(fy);
  }

  getOrgName(key):string{ 

    let org = this.orgs.find(o => o.id === key);    
    return org.abbreviation;
  }
   handleNewAttachments(newFile:FileMetaData):void{
      this.showUploadDialog = false;
      if(newFile){
        let attachment:Attachment = new Attachment();
        attachment.file = newFile;
        this.programBudgetData=true;
        this.uploadedFileId = newFile.id;
        this.LoadPomFromFile(newFile.id);
      }else{
        this.yearDropDown.selectedItem=this.yearDropDown.prompt;
      }     
  }

  onCreateProgrammingPhase():void{
    let year:any = this.selectedYear;
  }

  LoadPomFromFile(fileId:string){
    this.busy = true;
    this.pomService.getPomFromFile(fileId).subscribe(
      resp => {
        this.busy = false;
        var pom = (resp as PomServiceResponse).result ;
        console.log("year..." + pom.fy);
        this.initGrids(this.byYear);
        this.loadGrids(pom,this.byYear);
      },
      error => {
        this.busy = false;
        console.log(error);
      }
    );
  }
  ngOnInit() {
    console.log("in ngOninit");

    this.byYear= FormatterUtil.getCurrentFiscalYear()+2;
    let pbYear:any = FormatterUtil.getCurrentFiscalYear()+1;
    
    this.programYearSelected = "undefined";
    this.busy = true;
    this.pomService.pBYearExists(pbYear).subscribe(
      resp => { 
                let response:any = resp;
                
                this.busy = false;
                let pyear ="PB" + FormatterUtil.pad((pbYear-2000),2);
                let years: string[] = [pyear, "Spreadsheet"];
                this.availableYears = this.toListItem(years);
    
      },
      error =>{
                let response:any = error ;
                this.busy = false;                
                let years: string[] = ["Spreadsheet"];
                this.availableYears = this.toListItem(years);
                console.log(response.error);
      });
      
    //initialize chart options
    this.communityOptions = {
      minCols: 8,
      maxCols: 8,
      minRows: 8,
      maxRows: 8,
      itemResizeCallback: (event) => {
        if (event.id === 'community-graph') {
          let w: any = this.communityGraphItem;
          this.communityGraph.onResize(w.width, w.height);
        }
        this.saveWidgetLayout();
      },
      itemChangeCallback: () => {
        this.saveWidgetLayout();
      }
    };

    this.organizationOptions = {
      minCols: 8,
      maxCols: 8,
      minRows: 8,
      maxRows: 8,
      itemResizeCallback: (event) => {
        if (event.id === 'organization-graph') {
          let w: any = this.organizationGraphItem;
          this.organizationGraph.onResize(w.width, w.height);
        }
        this.saveWidgetLayout();
      },
      itemChangeCallback: () => {
        this.saveWidgetLayout();
      }
    };

    //defaults for Gridster
    this.communityDashboard = [{ x: 0, y: 0, cols: 8, rows: 8, id: 'community-graph' }];
    this.organizationDashboard = [{ x: 0, y: 0, cols: 8, rows: 8, id: "organization-graph" }];
}

// load chart preferences
private getPreferences():void{
  this.busy = true;
  this.dashboardService.getWidgetPreferences('community-graph').subscribe(
    data => {
      this.busy = false;
      if (data) {
        let list: Array<GridsterItem> = data as any;
        if (list && list.length > 0) {
          this.communityDashboard = list;
        }
      }

    },
    error => {
      this.busy = false;
      this.dialogService.displayDebug(error);
    }
  );

  this.dashboardService.getWidgetPreferences("organization-graph").subscribe(
    data => {
      this.busy = false;
      if(data){
        let list:Array<GridsterItem> = data as any;
        if(list && list.length > 0){
          this.organizationDashboard = list;
        }
      }

    },
    error => {
      this.busy = false;
      this.dialogService.displayDebug(error);
    }
  );
}

// save chart preferences
private saveWidgetLayout():void{

  this.dashboardService.saveWidgetPreferences('community-graph', this.communityDashboard).subscribe(
    data => {
    },
    error => {

    });
  this.dashboardService.saveWidgetPreferences('organization-graph', this.communityDashboard).subscribe(
    data => {
    },
    error => {

    });
}

  private toListItem(years:string[]):ListItem[]{
    let items:ListItem[] = [];
    for(let year of years){
      let item:ListItem = new ListItem();
      item.id = year;
      item.name = year;
      item.value = year;
      items.push(item);
    }
    return items;
  }

  validateFile(name: String) {
    var ext = name.substring(name.lastIndexOf('.') + 1);
    var res:boolean = ((ext==="xls") || (ext==="xlsx"));
    if (res) {
        console.log("File attached"+name);
    }
    else {
      this.dialogService.displayError("File selected must be an Excel spreadsheet");
    }
}

private setAgGridColDefs(column1Name:string, fy:number): any {

  let colDefs = [];

  colDefs.push(
    { headerName: column1Name,
      suppressMenu: true,
      field: 'orgid',
      minWidth: 140,      
      editable: false,
      pinned:'left',
      //rowDrag: true,
      //rowDragManaged: true,
      colSpan: function (params){        
        return (params.value === '1')? 7 : 1;
    },
      cellRenderer: params => params.value,
      cellClass: "text-class",    
      cellStyle: { display: 'flex', 'padding-left':'5px !important', 'align-items': 'center', 'white-space': 'normal'}
    
  });

  for (var i = 0; i < 5; i++) {
    colDefs.push(
      { headerName: "FY" + (fy + i - 2000) ,
        type: "numericColumn",
        minWidth: 110,        
        suppressMenu: true,
        field: (fy+ i).toString(),
        cellRenderer: params => this.negativeNumberRenderer(params),
        editable: true,
        cellClass: "pfm-datagrid-numeric-class",      
        cellStyle: { display: 'flex','padding-right':'10px !important'}
    });
  }
  colDefs.push(
    { headerName: "FY" + (fy-2000) + "-"+ "FY" + (fy+4-2000),
      type: "numericColumn",
      suppressMenu: true,
      field: 'total',
      minWidth: 110,     
      editable: false,
      valueGetter: params => this.rowTotal( params.data, fy ),
      cellRenderer: params => this.negativeNumberRenderer(params),
      cellClass: "pfm-datagrid-numeric-class",
      cellStyle: { display: 'flex', 'padding-right':'10px !important'}
  });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  

  colDefs.push(
    {
      headerName: 'Actions',
      field: 'actions',      
      mWidth: 100,
      maxWidth:100,
      cellRendererFramework: ActionCellRendererComponent
    }
  );

  return colDefs;
}

//updates the community graph with grid data
private updateCommunityGraphData(startYear:number) {
  //populate griddata
  this.communityGridData = [['Fiscal Year', 'PRs Submitted', 'Average',]];
  for (let i = 0; i < 5; i++){
    let year = 'FY' + (startYear + i - 2000);
    let amount = 0;
    let change = 0;
    //if there is a year
    if (this.communityData[1][startYear + i]) {
      amount = this.communityData[1][startYear + i];
    }
    if (this.communityData[1][startYear + i - 1]){
      let pastAmount = this.communityData[1][startYear + i - 1];
      change = ((amount - pastAmount) / pastAmount);
    }
    this.communityGridData[i + 1] = [year, amount, change];
  }

  this.communityGraph.columnChart.dataTable = this.communityGridData;
  this.communityGraph.columnChart.component.draw();
}

// a sinple CellRenderrer for negative numbers
private negativeNumberRenderer( params ){

  if (params.value == "")
    return params.value;

  if ( params.value < 0 ){
    return '<span style="color: red;">' + this.formatCurrency( params ) + '</span>';
  } else {
    return '<span style="color: black;">' + this.formatCurrency( params ) + '</span>';
  }
}

 // helper for currency formatting
 private formatCurrency( params ) {
  let str = Math.floor( params.value )
    .toString()
    .replace( /(\d)(?=(\d{3})+(?!\d))/g, "$1," );
  return "$ " + str;
}

// A valueGetter for totaling a row
private rowTotal( data, fy:number ){
  let total:number=0;
  for (var i = 0; i < 5; i++) {
    total += parseInt(data[fy+i],10);
  }
  return total;
}

// a callback for determining if a ROW is editable
private shouldEdit ( params ){
 return false;
}

onCommunityGridIsReady(gridApi:GridApi):void{
  this.communityGridApi = gridApi;
  gridApi.sizeColumnsToFit();
}

onOrgGridIsReady(gridApi:GridApi):void{
  this.orgGridApi = gridApi;

  gridApi.sizeColumnsToFit();
}
onCommunityColumnIsReady (columnApi:ColumnApi):void{
  this.commColumnApi = columnApi;
}

onOrgColumnIsReady(columnApi:ColumnApi):void{
  this.orgColumnApi = columnApi;
}

onRowDragEnd(param){}

onCommunityGridCellAction(cellAction:DataGridMessage){
  this.onCellAction(cellAction,"community");
}

onOrgGridCellAction(cellAction:DataGridMessage){
  this.onCellAction(cellAction,"org");
}

onCellAction(cellAction:DataGridMessage,gridType:any):void{
 
  switch(cellAction.message){
    case "save": {      
      this.onSaveRow(cellAction.rowIndex,gridType);
      break;
    }
    case "edit": {
      this.onEditRow(cellAction.rowIndex,gridType)
      break;
    }    
  }
}

onSaveRow(rowId,gridType):void{
  console.log('grid type :' + gridType);
  let editAction = this.onSaveAction(rowId);
  this.communityData[rowId].actions = editAction;
  
  this.communityGridApi.stopEditing();
}

onEditRow(rowId,gridId):void{
  console.log('grid type :' + gridId);
  let editAction = this.onEditAction(rowId,gridId);


  this.communityGridApi.startEditingCell({
    rowIndex:rowId,
    colKey:"2022"
  });
}

onEditAction(rowId:number,gridId):any{

  let  actions = this.communityData[rowId]["actions"];
  actions.canDelete = false;
  actions.canEdit = false;
  actions.canSave = true;
  actions.canUpload = false;

  return actions;
}

onSaveAction(rowId:number):any{

  let  actions = this.communityData[rowId]["actions"];
  actions.canDelete = false;
  actions.canEdit = true;
  actions.canSave = false;
  actions.canUpload = false;
  
  return actions;
}

}

