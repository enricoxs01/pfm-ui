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

  // this user's roles and all roles in a community
  private communityWithUserRoles: CommWithRoles[] = [];

  // The name of the role we are assigning the targetUser to
  addedroleId: string;

  // The name of the community we are assigning the targetUser to
  addedcommunity: string;

  // All the communities the user does not belong to
  avail_Communities: Community[] = [];

  // an original copy of the targted user so we can roll back.
  reftargetUser: User;

  // Have we hit the edit button or are we just viewing?
  isdEditMode: boolean[] = [];

  // Any error from a rest service
  resultError: string[]=[];

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
    this.resetEditMode();
  }


  getTargetUser(): void {
    this.communityWithUserRoles=[];
    // 1. get the user
    let resultUser: RestResult;
    this.userService.getById(this.id)
      .subscribe(c => {
        resultUser = c;
        this.resultError.push(resultUser.error);
        this.targetUser = resultUser.result;
        console.log("TargetUser: " + this.targetUser.cn);

        // 2. get the (all) communities 
        let allCommunities: Community[] = [];
        let resultComm: RestResult;

        let s = this.communityService.getAll();
        s.subscribe(c => {
          resultComm = c;
          this.resultError.push(resultComm.error);
          allCommunities = resultComm.result;

          // 3. Get the users Roles in each community
          for (let comm of allCommunities) {
            let resultUserRoles: RestResult;
            let s = this.roleService.getByUserIdAndCommunityId(this.targetUser.id, comm.id);
            s.subscribe(c => {
              resultUserRoles = c;
              this.resultError.push(resultUserRoles.error);

              // 4. Get all the roles for the community
              let resultAllRoles: RestResult;
              this.roleService.getByCommunityId(comm.id)
              .subscribe(c => {
                resultAllRoles = c;
                this.resultError.push(resultAllRoles.error);

                // push if at least one role
                if ( resultUserRoles.result.length>0 ){ 
                  this.communityWithUserRoles.push(new CommWithRoles(comm, resultUserRoles.result, resultAllRoles.result));

                  for (var i =0; i < allCommunities.length; i++){
                    if ( allCommunities[i].id === comm.id ){
                      allCommunities.splice(i,1);
                    }
                  }
                }
                this.avail_Communities=allCommunities;
              });
              // end 4
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

  addRole(): void {
 
     let userRole:UserRole=new Object();
      userRole.roleId=this.addedroleId;
      userRole.userId=this.id;
      console.log(userRole);
      
      let resultUserRole: RestResult;
      this.userRoleService.create(userRole)
      .subscribe(r => {
        resultUserRole = r;
        this.getTargetUser();
      });
  }

  resetAddRole(): void {
    this.addedroleId = '';
  }

  addCommunity(): void {
    console.log("addCommunity" + this.addedcommunity);

    let resultRole: RestResult;
    this.roleService.getByNameAndCommunityId(this.addedcommunity,"User")
    .subscribe(r => {
      resultRole = r;
      this.resultError.push(resultRole.error);

      let approverRole:Role;
      approverRole = resultRole.result;
      let userRole:UserRole=new Object();
      userRole.roleId=approverRole.id;
      userRole.userId=this.id;
      console.log(userRole);
      
      let resultUserRole: RestResult;
      this.userRoleService.create(userRole)
      .subscribe(r => {
        resultUserRole = r;

        this.getTargetUser();

      });
    });
  }

  resetAddCommunity(): void {
    this.addedcommunity = '';
  }

}

class CommWithRoles {

  community: Community;
  userRoles: Role[] = [];
  allRoles: Role[] = []; 

  constructor(c: Community, ur: Role[], ar: Role[]) {
    this.community = c;
    this.userRoles = ur;

    for (var i =0; i < ar.length; i++){
      for (let r of ur){
        if ( ar[i].name === r.name ){
          ar.splice(i,1);
        }
      }
    }
    this.allRoles=ar;
  }


}




