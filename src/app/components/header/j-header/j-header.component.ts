import { HeaderUserComponent } from '../header-user/header-user.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AuthUser } from '../../../generated/model/authUser';
import { RestResult } from '../../../generated/model/restResult';
import { BlankService } from '../../../generated/api/blank.service';

@Component({
  selector: 'j-header',
  templateUrl: './j-header.component.html',
  styleUrls: ['./j-header.component.scss'],
  providers: [NgbTooltipConfig]
})
export class JHeaderComponent implements OnInit {

  @ViewChild(HeaderUserComponent) headerUserComponent: HeaderUserComponent;
  isAuthenticated: boolean = false;
  authUser: AuthUser;

  constructor( private blankService: BlankService,
               private config: NgbTooltipConfig,
               private router: Router ) {
      config.placement = 'left';
  }

  ngOnInit() {
    this.blankService.blank("response", true).subscribe( (httpResponse: HttpResponse<RestResult>) => {
      const authHeader = httpResponse.headers.get('Authorization');
      this.isAuthenticated = true;
      if(authHeader) {
        this.authUser = JSON.parse(atob(authHeader));
        if (!this.authUser.currentCommunity) {
          this.router.navigate(['my-community'])
        }
      } else {
        this.router.navigate(['apply'])
      }
    },
    ()=>{
      this.router.navigate(['/'])
    });
  }

  async refresh() {
    await this.ngOnInit();
    this.headerUserComponent.menuBarComponent.refresh();
  }

}
