import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoWidgetOneComponent } from './widgets/demo-widget-one/demo-widget-one.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DemoWidgetTwoComponent } from './widgets/demo-widget-two/demo-widget-two.component';
import { DemoWidgetThreeComponent } from './widgets/demo-widget-three/demo-widget-three.component';
import { DemoWidgetFourComponent } from './widgets/demo-widget-four/demo-widget-four.component';



@NgModule({
  declarations: [DemoWidgetOneComponent, DashboardComponent, DemoWidgetTwoComponent, DemoWidgetThreeComponent, DemoWidgetFourComponent],
  imports: [
    CommonModule
  ],
  entryComponents: [DashboardComponent]
})
export class PfmDashabordModuleModule { }
