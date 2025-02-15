import { PlanningService } from './planning-service';
import { Observable, of } from 'rxjs';
import { MissionPriority } from '../models/MissionPriority';
import { Action } from '../../pfm-common-models/Action';

export class PlanningServiceMock extends PlanningService {
  sampleData =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.' +
    'Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum.' +
    'Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.' +
    'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.' +
    'Curabitur sodales ligula in libero.' +
    'Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam.' +
    'In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem.' +
    'Proin ut ligula vel nunc egestas porttitor.' +
    'Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa.' +
    'Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum.' +
    'Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum velit.' +
    'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.' +
    'Nam nec ante.' +
    'Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis.' +
    'Nulla facilisi.' +
    'Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet.' +
    'Vestibulum sapien. Proin quam. Etiam ultrices.' +
    'Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna.' +
    'Quisque cursus, metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam.' +
    'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;' +
    'Morbi lacinia molestie dui.' +
    'Praesent blandit dolor. Sed non quam. In vel mi sit amet augue congue elementum.' +
    'Morbi in ipsum sit amet pede facilisis laoreet. Donec lacus nunc, viverra nec.'.split('.');
  constructor() {
    super(null);
  }

  getAllPlanning(): Observable<object> {
    return this.get('planning');
  }

  createPlanningPhase(data: any): Observable<object> {
    return this.post('planning', data);
  }

  openPlanningPhase(data: any): Observable<object> {
    return this.put('planning/open', data);
  }

  lockPlanningPhase(data: any): Observable<object> {
    return this.put('planning/lock', data);
  }

  closePlanningPhase(data: any): Observable<object> {
    return this.put('planning/close', data);
  }

  createMissionPriority(data: any): Observable<object> {
    return of(data);
  }

  updateMissionPriority(data: any): Observable<object> {
    return of(data);
  }

  deleteMissionPriority(data: any): Observable<object> {
    return of(data);
  }

  getAvailableCreatePlanningYears(): Observable<object> {
    return of([2021, 2022, 2023]);
  }

  getMissionPrioritiesYears(): Observable<object> {
    return of([2021, 2022, 2023]);
  }

  getMissionPriorities(year: string): Observable<object> {
    const list: MissionPriority[] = [];

    if (year !== '2023') {
      for (let i = 0; i < 25; i++) {
        const data: MissionPriority = new MissionPriority();
        data.order = i + 1;
        data.title = this.sampleData[i] + year;
        data.description = this.sampleData[this.sampleData.length - 1 - i];
        data.actions = new Action();
        data.actions.canDelete = true;
        data.actions.canEdit = true;
        data.actions.canUpload = false;
        data.actions.canSave = false;

        data.attachments = [];
        /*TODO - MissionAttachment changed to match services: Attachment.ts
        let ma: MissionAttachment = new MissionAttachment();
        ma.name = 'abc.doc';
        ma.type = 'doc';
        ma.url = 'http://google.com';
        let test1: MissionAttachment = new MissionAttachment();
        test1.name = 'abcd.doc';
        test1.type = 'doc';
        test1.url = 'http://google.com';
        let test2: MissionAttachment = new MissionAttachment();
        test2.name = 'abcde.doc';
        test2.type = 'doc';
        test2.url = 'http://google.com';
        data.attachments.push(ma);
        data.attachments.push(test1);
        data.attachments.push(test2);
        */
        list.push(data);
      }
    }

    return of(list);
  }

  getMissionPrioritiesForPOM(year: string): Observable<object> {
    return null;
  }

  cloneMissionPriorities(phaseId: string): Observable<object> {
    return null;
  }

  getPlanningByYear(year: number) {
    return null;
  }
}
