import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

import { ExecutionFeatureRoutingModule } from './execution-feature-routing.module';
import { ExecutionFeatureComponent } from './execution-feature.component';
import { CreateExecutionComponent } from './create-execution/create-execution.component';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';
import { PfmSecureFileuploadModule } from '../pfm-secure-fileupload/pfm-secure-fileupload.module';
import { ExecutionService } from './services/execution.service';
import { ExecutionServiceServiceImpl } from './services/execution-service.service-impl';
import { RealignFundsComponent } from './funds-update/realign-funds/realign-funds.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ExecutionLineService } from './services/execution-line.service';
import { ExecutionLineServiceImpl } from './services/execution-line.service-impl';
import { FundsUpdateComponent } from './funds-update/funds-update.component';
import { PfmSecureFiledownloadModule } from '../pfm-secure-filedownload/pfm-secure-filedownload.module';

@NgModule({
  declarations: [ExecutionFeatureComponent, CreateExecutionComponent, FundsUpdateComponent, RealignFundsComponent],
  imports: [
    CommonModule,
    ExecutionFeatureRoutingModule,
    PfmCoreuiModule,
    PfmSecureFileuploadModule,
    ReactiveFormsModule,
    FormsModule,
    FontAwesomeModule,
    NgbModule,
    PfmSecureFiledownloadModule
  ],
  providers: [
    CurrencyPipe,
    { provide: ExecutionService, useClass: ExecutionServiceServiceImpl },
    { provide: ExecutionLineService, useClass: ExecutionLineServiceImpl }
  ]
})
export class ExecutionFeatureModule {}
