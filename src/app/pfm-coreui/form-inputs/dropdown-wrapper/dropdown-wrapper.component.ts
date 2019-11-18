import { Component, OnInit, Input } from '@angular/core';
import { ValidatedComponent } from '../../models/validated-component';

@Component({
  selector: 'pfm-dropdown-wrapper',
  templateUrl: './dropdown-wrapper.component.html',
  styleUrls: ['./dropdown-wrapper.component.scss']
})
export class DropdownWrapperComponent implements OnInit, ValidatedComponent {

  @Input() dataModel:any;
  @Input() id:string;
  @Input() fieldName:string;
  @Input() inputLabel:string;
  @Input() enabled:boolean = true;
  @Input() errorMessage:string;
  @Input() dropdownOptions:Array<any>;

  isValidFlag:boolean;

  constructor() {}


    ngOnInit() {
    }

    //If the input is enabled, check if it is empty. If it is not empty, return true
    isValid(): boolean{
        this.isValidFlag = true;

        if(!this.dataModel[this.fieldName] || this.dataModel[this.fieldName].length == 0 || this.dropdownOptions.length == 0){
            this.isValidFlag = false;
        }

        return this.isValidFlag;
  }

  errorExists(){
    return (this.errorMessage == undefined ? false : true );
  }

}