import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ElevationService} from '../../../services/elevation.component';
import {AuthUser} from '../../../generated/model/authUser';
import {RequestsService} from '../../../services/requests.service';
import {Request} from '../../../services/request';
import {POMService} from '../../../generated/api/pOM.service';
import {Pom} from '../../../generated/model/pom';
import {MenuBarComponent} from "../../menu-bar/menu-bar.component";
import {UserActionsComponent} from "../../menu-bar/user-actions/user-actions.component";
import {PrChangeNotification, PrChangeNotificationsService, RolesPermissionsService} from "../../../generated";

@Component({
  selector: 'header-user',
  templateUrl: './header-user.component.html',
  styleUrls: ['./header-user.component.scss']
})
export class HeaderUserComponent {

  @Input() isAuthenticated: boolean;
  @Input() authUser: AuthUser;

  @ViewChild(MenuBarComponent) menuBarComponent: MenuBarComponent;
  @ViewChild(UserActionsComponent) userActionsComponent: UserActionsComponent;

  pomStatus: Pom.StatusEnum;
  requests: Request[] = [];
  prChangeNotifications: PrChangeNotification[] = [];
  notificationsTotal: number;

  constructor( public elevationService: ElevationService,
               private pomService: POMService,
               private requestsService: RequestsService,
               private prChangeNotificationsService: PrChangeNotificationsService,
               private rolesvc: RolesPermissionsService) {
  }

  async ngOnInit() {
    this.requests = await this.requestsService.getRequests().toPromise();
    this.rolesvc.getRoles().subscribe(async data => {
      if (data.result.includes('Funds_Requestor')) {
        this.prChangeNotifications = (await this.prChangeNotificationsService.getByOrganization().toPromise()).result;
      }
    });

    this.pomService.getByCommunityId(this.authUser.currentCommunity.id).subscribe(data => {
      delete this.pomStatus;
      data.result.forEach((p: Pom) => {
        this.pomStatus = p.status;
      });
    });

    setTimeout(() => {
      this.notificationsTotal = this.requests.length + this.prChangeNotifications.length
    }, 100)
   }

   refresh() {
     this.ngOnInit();
     this.userActionsComponent && this.userActionsComponent.ngOnInit();
   }

}
