import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ElevationService} from '../../../services/elevation.component';
import {AuthUser} from '../../../generated/model/authUser';
import {RequestsService} from '../../../services/requests.service';
import {POMService} from '../../../generated/api/pOM.service';
import {Pom} from '../../../generated/model/pom';
import {MenuBarComponent} from "../../menu-bar/menu-bar.component";

@Component({
  selector: 'header-user',
  templateUrl: './header-user.component.html',
  styleUrls: ['./header-user.component.scss']
})
export class HeaderUserComponent {

  @Input() isAuthenticated: boolean;
  @Input() authUser: AuthUser;
  pomStatus: Pom.StatusEnum;


  @ViewChild(MenuBarComponent) menuBarComponent: MenuBarComponent;

  requests: Request[];
  prChangeNotifications: PrChangeNotification[];

  constructor( private requestsService: RequestsService,
                 public elevationService: ElevationService,
                 private pomService: POMService ) {}

   async ngOnInit() {
     this.requests = await this.requestsService.getRequests().toPromise();
     this.prChangeNotifications = (await this.prChangeNotificationsService.getByOrganization().toPromise()).result;
     this.pomService.getByCommunityId(this.authUser.currentCommunity.id).subscribe(data => {
       delete this.pomStatus;
       data.result.forEach((p: Pom) => {
         this.pomStatus = p.status;
       });
     });
   }

   refresh() {
     this.ngOnInit();
     this.userActionsComponent && this.userActionsComponent.ngOnInit();
     this.prChangeNotificationsComponent && this.prChangeNotificationsComponent.ngOnInit();
   }

}
