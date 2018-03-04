import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {
  HttpClient, HttpHeaders, HttpParams,
  HttpResponse, HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Response, ResponseContentType } from '@angular/http';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

// Generated
import { User } from '../../../generated/model/user';
import { RestResult } from '../../../generated/model/restResult';
import { CommunityService } from '../../../generated/api/community.service';
import { Community } from '../../../generated/model/community';
import { UserService } from '../../../generated/api/user.service';
import { Role } from '../../../generated/model/role';
import { RoleService } from '../../../generated/api/role.service';
import { UserRole } from '../../../generated/model/userRole';
import { UserRoleService } from '../../../generated/api/userRole.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  // This is the id of the user we are interested in ... the targetUser
  id: string;

  // The user we are interested in.
  targetUser: User;

  // all the roles available ( all minus the ones we have )
  all_Roles: Role[] = [];

  // The UserRoles that this user has
  //targetUser_UserRoles: UserRole[] = [];

  // The Roles this user has
  targetUser_Roles: UserRole[] = [];

  // The name of the role we are assigning the targetUser to
  addedrole: string;

  // The name of the community we are assigning the targetUser to
  addedcommunity: string;

  // All the communities
  all_Communities: Community[] = [];

  // an original copy of the targted user so we can roll back.
  reftargetUser: User;

  // Have we hit the edit button or are we just viewing?
  isdEditMode: boolean[] = [];

  // Any error from a rest service
  resultError: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private roleService: RoleService,
    private communityService: CommunityService,
    private userRoleService: UserRoleService,

  ) {
    this.route.params.subscribe((params: Params) => {
      this.id = params.id;
    });
  }

  ngOnInit() {
    this.getTargetUser();
    this.getAllRoles();
    this.getCommunities();
    this.resetEditMode();
  }

  getTargetUser(): void {

    // 1. get the user
    let resultUser: RestResult;
    this.userService.getById(this.id)
      .subscribe(c => {
        resultUser = c;
        this.resultError = resultUser.error;
        this.targetUser = resultUser.result;
        console.log("TargetUser: " + this.targetUser.cn);

        // 2. get the (all) communities 
        let targetUserCommunities: Community[] = [];
        let resultComm: RestResult;

        let s = this.communityService.getAll();
        s.subscribe(c => {
          resultComm = c;
          this.resultError = resultComm.error;
          targetUserCommunities = resultComm.result;

          // 3. Get the users Roles in each community
          for (let comm of targetUserCommunities) {
            let resultRoles: RestResult;
            let s = this.userRoleService.getUserRolesforCommunity(this.targetUser.id, comm.id);
            s.subscribe(c => {
              resultRoles = c;
              this.resultError = resultRoles.error;
              // oush if at least one role
              if ( resultRoles.result.length>0 ){ 
                this.communityWithUserRoles.push(new CommWithRoles(comm, resultRoles.result));
              }
            });
          }
          // end 3
        });
        // end 2

        // Make a copy of the current user so we can revert changes
        this.reftargetUser = JSON.parse(JSON.stringify(this.targetUser));
      });
      // end 1
  }

  saveTargetUser(): void {
    let result: RestResult;
    this.userService.updateUser(this.targetUser)
      .subscribe(r => {
        result = r;
      });
    this.resetEditMode();
  }

  // set a section to edit mode
  editMode(sectionnumber): void {
    this.resetEditMode();
    this.isdEditMode[sectionnumber] = true;
    //this.buildAvailableRoles();
  }

  cancelEdit(): void {
    // revert changes
    this.targetUser = JSON.parse(JSON.stringify(this.reftargetUser));
    this.resetEditMode();
  }

  resetEditMode(): void {
    for (var i = 0; i < 5; i++) {
      this.isdEditMode[i] = false;
    }
  }

  getAllRoles(): void {

    let result1: RestResult;
    this.roleService.getAll()
      .subscribe(c => {
        result1 = c;
        this.resultError = result1.error;
        this.all_Roles = result1.result;
      });
  }

  resetAddRole(): void {
    this.addedrole = '';
  }

  getCommunities(): void {
    let result: RestResult;
    this.communityService.getAll()
      .subscribe(c => {
        result = c;
        this.resultError = result.error;
        this.all_Communities = result.result;
      });
  }

  addCommunity(): void {
    console.log("addCommunity" + this.addedcommunity);


    let result2: RestResult;
    this.communityService.getById(this.addedcommunity)
    .subscribe(c => {
      result2 = c;
      this.resultError = result2.error;





    });
  }

  resetAddCommunity(): void {
    this.addedcommunity = '';
  }


  private communityWithUserRoles: CommWithRoles[] = [];


}

class CommWithRoles {

  community: Community;
  roles: Role[] = [];

  constructor(c: Community, r: Role[]) {
    this.community = c;
    this.roles = r;
  }


}




