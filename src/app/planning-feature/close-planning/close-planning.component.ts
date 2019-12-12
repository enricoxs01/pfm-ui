import { Component, OnInit } from '@angular/core';
import { ListItem } from '../models/ListItem';
import { AppModel } from '../../pfm-common-models/AppModel';
import { PlanningService } from '../services/planning-service';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { ActivatedRoute } from '@angular/router';
import { SigninService } from '../../pfm-auth-module/services/signin.service';

@Component({
  selector: 'pfm-planning',
  templateUrl: './close-planning.component.html',
  styleUrls: ['./close-planning.component.scss']
})
export class ClosePlanningComponent implements OnInit {

  id:string = 'mission-priorities-component';
  busy:boolean;
  actionInProgress:boolean = false;
  availableYears: ListItem[];
  selectedYear:string;
  validInput:boolean = false;
  POMManager:boolean = false;

  constructor(private appModel:AppModel, private planningService:PlanningService, private dialogService:DialogService, private route:ActivatedRoute, private signInService:SigninService) { }

  ngOnInit() {
    this.POMManager = this.appModel.userDetails.userRole.isPOM_Manager;
    let years:string[] = [];
    for(let item of this.appModel.planningData){
      if(item.state === "LOCKED"){
        years.push(item.name);
      }
    }
    this.availableYears = this.toListItem(years);
  }

  closePlanningPhase(){    
    this.busy = true;
    let planningData = this.appModel.planningData.find( obj => obj.id === this.selectedYear + "_id");
    this.planningService.closePlanningPhase(planningData).subscribe(
      resp => {
        this.busy = false;
        this.dialogService.displayToastInfo(`Planning Phase for ${ this.selectedYear } successfully closed`);  
        this.availableYears = this.availableYears.filter(obj => obj.id != this.selectedYear);
        },
      error =>{
        this.busy = false;
        this.dialogService.displayDebug(error);
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

  //check if current user has POM Manager role
  isPOMManager(){
    this.signInService.getUserRoles().subscribe(
      resp  => {
        let result: any = resp;
        if(result.result.includes("POM_Manager")){
          this.POMManager = true;
        }
      },
      error =>{
        this.busy = false;
        this.dialogService.displayDebug(error);
      });
  }

  yearSelected(item:any):void{
    this.selectedYear = item ? item.name : undefined;    
  }
}
