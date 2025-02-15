import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgrammingModel } from '../../models/ProgrammingModel';
import { RequestSummaryNavigationHistoryService } from '../requests-summary/requests-summary-navigation-history.service';
import { ScheduleComponent } from './schedule/schedule.component';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { ProgrammingService } from '../../services/programming-service';
import { Program } from '../../models/Program';
import { RequestsDetailsFormComponent } from './requests-details-form/requests-details-form.component';
import { ScopeComponent } from './scope/scope.component';
import { JustificationComponent } from './justification/justification.component';
import { AssetsComponent } from './assets/assets.component';
import { VisibilityService } from 'src/app/services/visibility-service';
import { AppModel } from 'src/app/pfm-common-models/AppModel';
import { ToastService } from 'src/app/pfm-coreui/services/toast.service';
import { RequestsFundingLineGridComponent } from './requests-funding-line-grid/requests-funding-line-grid.component';
import { ProgramStatus } from '../../models/enumerations/program-status.model';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { PomService } from '../../services/pom-service';
import { RestResponse } from 'src/app/util/rest-response';
import { Pom } from '../../models/Pom';
import { PomStatus } from '../../models/enumerations/pom-status.model';
import { of } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { LocalVisibilityService } from 'src/app/core/local-visibility.service';
import { VisibilityDef } from 'src/app/pfm-common-models/visibility-def.model';

@Component({
  selector: 'pfm-requests-details',
  templateUrl: './requests-details.component.html',
  styleUrls: ['./requests-details.component.scss']
})
export class RequestsDetailsComponent implements OnInit {
  @ViewChild('detailsForm')
  requestDetailsFormComponent: RequestsDetailsFormComponent;
  @ViewChild('fundingLines')
  fundingLinesComponent: RequestsFundingLineGridComponent;
  @ViewChild('pfmSchedule')
  pfmSchedule: ScheduleComponent;
  @ViewChild('scope')
  scopeComponent: ScopeComponent;
  @ViewChild('assets')
  assetsComponent: AssetsComponent;
  @ViewChild('justification')
  justificationComponent: JustificationComponent;

  currentSelectedTab = 1;
  pomYear: number;
  program: Program;
  busy: boolean;
  disableSchedule = false;
  editMode: boolean;
  isPOMLocked: boolean;

  constructor(
    public programmingModel: ProgrammingModel,
    private programmingService: ProgrammingService,
    private route: ActivatedRoute,
    private router: Router,
    private requestSummaryNavigationHistoryService: RequestSummaryNavigationHistoryService,
    private visibilityService: VisibilityService,
    private localVisibilityService: LocalVisibilityService,
    private toastService: ToastService,
    private dialogService: DialogService,
    private pomService: PomService
  ) {}

  goBack(): void {
    const canGoBack = this.hasNoEditingGrids(false, false);
    if (canGoBack) {
      this.performBackButton();
    } else {
      this.dialogService.displayConfirmation(
        'You have unsaved data in fields or grids on one or more tabs. ' +
          'If you continue this data will be lost. ' +
          'Do you want to continue and lose this data?',
        'Caution',
        () => {
          this.performBackButton();
        },
        () => {},
        'Lose Data'
      );
    }
  }

  private performBackButton() {
    this.requestSummaryNavigationHistoryService.prepareNavigationHistory();
    this.router.navigate(['/programming/requests']);
  }

  ngOnInit() {
    this.programmingModel.selectedProgramId = this.route.snapshot.paramMap.get('id');
    this.pomYear = Number(this.route.snapshot.paramMap.get('pomYear'));
    const openTab = Number(this.route.snapshot.paramMap.get('tab') ?? 1);
    this.loadPom();
    this.loadProgram();
    this.setupVisibility();
    this.editMode = history.state.editMode;
    this.currentSelectedTab = openTab < 0 || openTab > 5 ? 1 : openTab;
  }

  private loadPom() {
    this.pomService.getLatestPom().subscribe(
      (resp: RestResponse<Pom>) => {
        this.programmingModel.pom = resp.result;
        this.isPOMLocked = this.programmingModel.pom.status === PomStatus.LOCKED;
      },
      error => {
        this.dialogService.displayDebug(error);
      }
    );
  }

  async loadProgram() {
    await this.programmingService
      .getProgramById(this.programmingModel.selectedProgramId)
      .toPromise()
      .then(resp => {
        this.program = resp.result as Program;
      });
  }

  async setupVisibility() {
    this.visibilityService.isVisible('programming-detail-component').subscribe(res => {
      const visibilityDef: VisibilityDef = { 'programming-detail-component': (res as any).result };
      this.localVisibilityService.updateVisibilityDef(visibilityDef);
    });
  }

  onApprove(): void {
    this.busy = true;
    if (this.program.programStatus === ProgramStatus.REJECTED) {
      this.toastService.displayError(
        'You cannot approve a PR in rejected state. You must first make edits and save it prior to approving.'
      );
    } else if (this.program.programStatus === ProgramStatus.APPROVED) {
      this.toastService.displayWarning('Already in approved status.');
    } else {
      if (this.onValidate(false)) {
        this.busy = true;
        this.programmingService
          .approve(this.program)
          .subscribe(
            resp => {
              this.toastService.displaySuccess('PR successfully approved');
              this.program = (resp as any).result;
            },
            error => {
              this.toastService.displayError(error.error.error);
            }
          )
          .add(() => (this.busy = false));
      }
    }
  }

  onSave(): void {
    this.busy = true;
    let pro = this.program;
    const canSave = this.hasNoEditingGrids(true);
    if (canSave) {
      pro = this.getFromDetailForm(pro);
      pro = this.getFromScopeForm(pro);
      pro = this.getFromAssets(pro);
      pro = this.getFromJustificationForm(pro);
      this.performSaveOrCreate(
        pro.id
          ? this.programmingService.save.bind(this.programmingService)
          : this.programmingService.create.bind(this.programmingService),
        pro
      );
    }
  }

  private performSaveOrCreate(programServiceCall, program: Program) {
    programServiceCall(program)
      .subscribe(
        resp => {
          this.program = resp.result as Program;
          this.toastService.displaySuccess('Program request saved successfully.');
        },
        error => {
          this.toastService.displayError('An error has ocurred while attempting to save program.');
        }
      )
      .add(() => (this.busy = false));
  }

  private hasNoEditingGrids(isSave: boolean, displayToast: boolean = true) {
    const errorMessage = isSave
      ? 'Please save all rows in grids before saving the page.'
      : 'Please save row(s) currently open for editing.';
    let canSave = true;
    if (this.scopeComponent) {
      let editing = 0;
      editing += this.scopeComponent.evaluationMeasureGridApi.getEditingCells().length;
      editing += this.scopeComponent.teamLeadGridApi.getEditingCells().length;
      editing += this.scopeComponent.processPriorizationGridApi.getEditingCells().length;
      if (editing) {
        canSave = false;
        if (displayToast) {
          this.toastService.displayError(errorMessage, 'Scope');
        }
      }
    }
    if (this.fundingLinesComponent) {
      let editing = 0;
      if (this.fundingLinesComponent.summaryFundingLineGridApi) {
        editing += this.fundingLinesComponent.summaryFundingLineGridApi.getEditingCells().length;
      }
      if (this.fundingLinesComponent.nonSummaryFundingLineGridApi) {
        editing += this.fundingLinesComponent.nonSummaryFundingLineGridApi.getEditingCells().length;
      }
      if (editing) {
        canSave = false;
        if (displayToast) {
          this.toastService.displayError(errorMessage, 'Funds');
        }
      }
    }
    if (this.pfmSchedule) {
      if (this.pfmSchedule.gridApi.getEditingCells().length) {
        canSave = false;
        if (displayToast) {
          this.toastService.displayError(errorMessage, 'Schedule');
        }
      }
    }
    if (this.assetsComponent) {
      if (this.assetsComponent.assetGridApi) {
        if (this.assetsComponent.assetGridApi.getEditingCells().length) {
          canSave = false;
          if (displayToast) {
            this.toastService.displayError(errorMessage, 'Assets');
          }
        }
      }
    }
    return canSave;
  }

  onReject(): void {
    this.busy = true;
    let pro = this.program;
    const canSave = this.hasNoEditingGrids(false);
    if (canSave) {
      pro = this.getFromDetailForm(pro);
      pro = this.getFromScopeForm(pro);
      pro = this.getFromAssets(pro);
      pro = this.getFromJustificationForm(pro);
      this.programmingService
        .reject(pro)
        .subscribe(
          resp => {
            this.toastService.displaySuccess('Program request was successfully rejected.');
            this.program = resp.result as Program;
          },
          error => {
            if (error.status === 400) {
              this.toastService.displayWarning(error.error.error);
            } else {
              this.toastService.displayError(error.error.error);
            }
          }
        )
        .add(() => (this.busy = false));
    }
  }

  onValidate(showSucessfulMessage: boolean): boolean {
    let passedValidation = true;
    let program = { ...this.program };
    passedValidation = this.hasNoEditingGrids(false);
    if (this.requestDetailsFormComponent) {
      program = this.getFromDetailForm(program);
      if (!program.shortName) {
        passedValidation = false;
        this.toastService.displayError('Program ID field must not be empty.', 'Program');
      }
      if (!program.longName) {
        passedValidation = false;
        this.toastService.displayError('Program Name field must not be empty.', 'Program');
      }
      if (!program.type) {
        passedValidation = false;
        this.toastService.displayError('Program Type field must not be empty.', 'Program');
      }
      if (!program.organizationId) {
        passedValidation = false;
        this.toastService.displayError('Organization field must not be empty.', 'Program');
      }
      if (
        this.requestDetailsFormComponent.showMissionPriority &&
        !this.requestDetailsFormComponent.showMissionPriorityMessage
      ) {
        if (!program.missionPriorityId) {
          passedValidation = false;
          this.toastService.displayError('Mission Priority field must not be empty.', 'Program');
        }
      }
    }
    if (passedValidation && showSucessfulMessage) {
      this.toastService.displaySuccess('All validations passed.');
    }
    return passedValidation;
  }

  onValidateAndSave(): void {
    this.busy = true;
    let prog = this.program;
    prog = this.getFromDetailForm(prog);
    prog = this.getFromScopeForm(prog);
    prog = this.getFromAssets(prog);
    prog = this.getFromJustificationForm(prog);

    of(this.onValidate(false))
      .pipe(
        takeWhile(Boolean),
        switchMap(() => this.programmingService.validateAndSave(prog))
      )
      .subscribe(
        (resp: RestResponse<Program>) => {
          this.toastService.displaySuccess('PR successfully validated and saved');
          this.program = resp.result;
        },
        error => {
          this.toastService.displayError(error.error.error);
        }
      )
      .add(() => (this.busy = false));
  }

  onSelectTab(event: TabDirective) {
    switch (event.heading.toLowerCase()) {
      case 'program':
        this.currentSelectedTab = 0;
        break;
      case 'funds':
        this.currentSelectedTab = 1;
        break;
      case 'schedule':
        setTimeout(() => {
          this.pfmSchedule.ngOnInit();
          this.pfmSchedule.changePageEditMode(this.editMode);
        }, 0);
        this.currentSelectedTab = 2;
        break;
      case 'scope':
        this.scopeComponent.loadExternalInfo();
        this.currentSelectedTab = 3;
        break;
      case 'assets':
        this.assetsComponent.getFundingLineOptions();
        this.currentSelectedTab = 4;
        break;
      case 'justification':
        setTimeout(() => this.justificationComponent.loadChart(), 0);

        this.currentSelectedTab = 5;
        break;
    }
  }

  private getFromDetailForm(program: Program): Program {
    return {
      ...program,
      shortName: this.requestDetailsFormComponent.addMode
        ? this.requestDetailsFormComponent.form.get(['shortName']).value
        : program.shortName,
      longName: this.requestDetailsFormComponent.form.get(['longName']).value,
      type: this.requestDetailsFormComponent.addMode
        ? this.requestDetailsFormComponent.form.get(['type']).value
        : program.type,
      organizationId:
        this.requestDetailsFormComponent.addMode || this.requestDetailsFormComponent.isPreviousYear
          ? this.requestDetailsFormComponent.form.get(['organizationId']).value
          : program.organizationId,
      divisionId: this.requestDetailsFormComponent.form.get(['divisionId']).value,
      missionPriorityId:
        this.requestDetailsFormComponent.showMissionPriority &&
        !this.requestDetailsFormComponent.showMissionPriorityMessage
          ? this.requestDetailsFormComponent.form.get(['missionPriorityId']).value
          : null,
      agencyPriority: this.requestDetailsFormComponent.form.get(['agencyPriority']).value,
      directoratePriority: this.requestDetailsFormComponent.form.get(['directoratePriority']).value,
      secDefLOEId: this.requestDetailsFormComponent.form.get(['secDefLOEId']).value,
      strategicImperativeId: this.requestDetailsFormComponent.form.get(['strategicImperativeId']).value,
      agencyObjectiveId: this.requestDetailsFormComponent.form.get(['agencyObjectiveId']).value
    };
  }

  private getFromScopeForm(program: Program): Program {
    return {
      ...program,
      aim: this.scopeComponent.form.get(['aim']).value,
      goal: this.scopeComponent.form.get(['goal']).value,
      quality: this.scopeComponent.form.get(['quality']).value,
      other: this.scopeComponent.form.get(['other']).value,
      attachments: [...this.scopeComponent.programAttachments]
    };
  }

  private getFromJustificationForm(program: Program): Program {
    return {
      ...program,
      justification: this.justificationComponent.form.get(['justification']).value,
      impactN: this.justificationComponent.form.get(['impactN']).value
    };
  }

  private getFromAssets(program: Program): Program {
    return {
      ...program,
      assets: this.assetsComponent.getProgramAssets()
    };
  }

  onEditModeChange(editMode: boolean) {
    this.editMode = editMode;
    this.requestDetailsFormComponent.changeEditMode(editMode);
    this.fundingLinesComponent.changeEditMode(editMode);
    this.pfmSchedule.changePageEditMode(editMode);
    this.scopeComponent.changeEditMode(editMode);
    this.assetsComponent.changePageEditMode(editMode);
    this.justificationComponent.changeEditMode(editMode);
  }
}
