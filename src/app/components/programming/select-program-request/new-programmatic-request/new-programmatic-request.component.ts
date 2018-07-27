import { CreationTimeType } from './../../../../generated/model/creationTimeType';
import { WithFullNameService, ProgramWithFullName, ProgramRequestWithFullName, WithFullName } from '../../../../services/with-full-name.service';
import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';

// Other Components
import { ProgramRequestPageModeService} from '../../program-request/page-mode.service';

@Component({
  selector: 'new-programmatic-request',
  templateUrl: './new-programmatic-request.component.html',
  styleUrls: ['./new-programmatic-request.component.scss']
})
export class NewProgrammaticRequestComponent implements OnInit {

  addNewPrFor: string;
  @Input() pomId: string;
  allPrograms: ProgramWithFullName[];
  selectableProgramsOrPrs: ProgramWithFullName[];
  selectedProgramOrPr: ProgramWithFullName;

  constructor(
    private router: Router,
    private programRequestPageMode: ProgramRequestPageModeService,
    private withFullNameService: WithFullNameService
  ) {}

  async ngOnInit() {
    this.allPrograms = await this.withFullNameService.programs()
  }
  
  async addNewPrRadio(selection: string) {
    this.addNewPrFor = selection;
    switch(this.addNewPrFor) {
      case 'An Existing Program of Record':
        this.selectableProgramsOrPrs = await this.programsMunisPrs();
        this.selectedProgramOrPr = this.selectableProgramsOrPrs[0];
        break;
      case 'A New Subprogram':
        this.selectableProgramsOrPrs = await this.withFullNameService.programsPlusPrs(this.pomId);
        this.selectedProgramOrPr = this.selectableProgramsOrPrs[0];
    }
  }
  
  async next() {
    switch(this.addNewPrFor) {
      case 'An Existing Program of Record':
        this.programRequestPageMode.set(CreationTimeType.PROGRAM_OF_MRDB , this.pomId);
        this.programRequestPageMode.reference = this.selectedProgramOrPr;
        break;
      case 'A New Subprogram':
        if(this.isProgram(this.selectedProgramOrPr)) {
          this.programRequestPageMode.set(CreationTimeType.SUBPROGRAM_OF_MRDB, this.pomId);
          this.programRequestPageMode.reference = this.selectedProgramOrPr;
        } else { // a PR has been selected
          this.programRequestPageMode.set(CreationTimeType.SUBPROGRAM_OF_PR_OR_UFR, this.pomId);
          this.programRequestPageMode.reference = this.selectedProgramOrPr;
        }
        break;
      case 'A New Program':
        this.programRequestPageMode.set(CreationTimeType.NEW_PROGRAM, this.pomId);
    }
    this.router.navigate(['/program-request']);
  }
  
  private async programsMunisPrs(): Promise<ProgramWithFullName[]> {
    const prs: ProgramRequestWithFullName[] = await this.withFullNameService.programRequestsWithFullNamesDerivedFromCreationTimeData(this.pomId);
    
    const referenceIds: Set<string> = new Set();
    prs.forEach( (pr: ProgramRequestWithFullName) => referenceIds.add(pr.creationTimeReferenceId));
    
    return this.allPrograms.filter( (program: ProgramWithFullName) => !referenceIds.has(program.id) );
  }

  private isProgram(programOrPr): boolean {
    return (typeof programOrPr.fundingLines) === 'undefined';
  }
}
