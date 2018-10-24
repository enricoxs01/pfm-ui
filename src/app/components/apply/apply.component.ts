import { Component, OnInit } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Router } from '@angular/router';

// Generated
import { Stranger, Community, Organization, CreateUserRequest, RestResult } from '../../generated';
import { StrangerService, CreateUserRequestService  } from '../../generated';
import { Notify } from '../../utils/Notify';

@Component({
  selector: 'app-apply',
  templateUrl: './apply.component.html',
  styleUrls: ['./apply.component.scss']
})
export class ApplyComponent implements OnInit {

  private resultError: string[] = [];
  private stranger: Stranger;
  private communities: Community[] = [];
  private organizations: Organization[] = [];
  private allOrganizations:  Organization[] = [];
  private ndaSatisfied: boolean;
  private ndaText:string;
  private createUserRequest: CreateUserRequest = new Object();
  private formsubmitted: boolean;

  constructor(
    private createUserRequestService: CreateUserRequestService,
    private strangerService: StrangerService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.formsubmitted = false;
    this.ndaSatisfied = true;
    this.getStranger();
  }

  private getStranger(): void {
    let resultStranger: RestResult;

    this.strangerService.get().subscribe(data => {
      resultStranger = data;
      this.resultError.push(resultStranger.error);
      this.stranger = resultStranger.result;
      if ( this.stranger.contractor ){
        this.ndaSatisfied = false;
      }
      this.communities = this.stranger.communities;
      this.allOrganizations = this.stranger.organizations;
      this.ndaText = this.stranger.nda;
    });
  }

  private filterOrgs( commId:string ){  
    this.organizations =  this.allOrganizations.filter(org => org.communityId == commId);
  }

  private onSubmit({ value, valid }) {
    if (valid) {

      this.createUserRequest = value;
      this.createUserRequest.status = "UNDECIDED";
      this.createUserRequest.cn = this.stranger.cn;      

      if ( this.stranger.contractor ){
        this.createUserRequest.nda = this.ndaText.substring(0,this.ndaText.indexOf("\n"));
      } else {
        this.createUserRequest.nda="NA"
      }

      let resultReq: RestResult;
      this.createUserRequestService.create(this.createUserRequest)
        .subscribe(c => {
          resultReq = c;
        });

      this.formsubmitted = true;

      Notify.success("Your application to join JSCBIS has been submitted. Please check your email for the status of your request.");
    } else {
      Notify.error("An error occured. Unable to submit New User Request Form");
    }
  }

}
