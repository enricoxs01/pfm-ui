import { Component, OnInit, ViewChild } from '@angular/core';
import { UserComponent } from '../user/user.component';
import { User } from '../../generated/model/user';
import { RestResult } from '../../generated/model/restResult';
import { Communication } from '../../generated/model/communication';
import { HeaderComponent } from '../../components/header/header.component';
import { CommunityService, Community, UserService } from '../../generated';


import { Response, ResponseContentType } from '@angular/http';
import {
  HttpClient, HttpHeaders, HttpParams,
  HttpResponse, HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  id: string;
  jsonUser: string;

  targetUser:User;
  resultError: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,

  ) {
    this.route.params.subscribe((params: Params) => {
      this.id = params.id;
    });
  }

  ngOnInit() {
    this.getTargetUser();
  }


  getTargetUser(): void{
    let result:RestResult;
    this.userService.get(this.id)
    .subscribe(c => {
      result = c;
      this.resultError = result.error;
      this.targetUser=result.result;

      console.log(this.targetUser);
            

    });
  }

}
