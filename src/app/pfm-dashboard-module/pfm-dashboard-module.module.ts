import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DemoWidgetMissionFundingPriorityComponent } from './widgets/demo-widget-mission-funding-priority/demo-widget-mission-funding-priority.component';
import { DemoWidgetMissionFundingMoneyComponent } from './widgets/demo-widget-mission-funding-money/demo-widget-mission-funding-money.component';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { DemoWidgetPOMPhaseFundingComponent } from './widgets/demo-widget-pom-phase-funding/demo-widget-pom-phase-funding.component';
import { DemoWidgetPrStatusComponent } from './widgets/demo-widget-pr-status/demo-widget-pr-status.component';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';
import { FormsModule } from '@angular/forms';
import { DashboardService } from './services/dashboard.service';
import { DashboardMockService } from './services/dashboard.mock.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GridsterModule } from 'angular-gridster2';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AssignedToMeComponent } from './assigned-to-me/assigned-to-me.component';
import { CompletedComponent } from './completed/completed.component';
import { MyPendingRequestsComponent } from './my-pending-requests/my-pending-requests.component';

@NgModule({
  declarations: [
    DashboardComponent,
    DemoWidgetMissionFundingPriorityComponent,
    DemoWidgetMissionFundingMoneyComponent,
    DemoWidgetPOMPhaseFundingComponent,
    DemoWidgetPrStatusComponent,
    AssignedToMeComponent,
    CompletedComponent,
    MyPendingRequestsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    Ng2GoogleChartsModule,
    FontAwesomeModule,
    DragDropModule,
    GridsterModule,
    PfmCoreuiModule
  ],
  exports: [DashboardComponent],
  providers: [DashboardService, DashboardMockService] // TODO - see notes in DashboardMockService
})
export class PfmDashabordModuleModule {}
