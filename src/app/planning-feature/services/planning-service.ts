import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';

export abstract class PlanningService extends BaseRestService{

  constructor(protected httpClient:HttpClient){
    super(httpClient);
  }

  abstract getAllPlanning():Observable<Object>;
  abstract createMissionPriority(data:any):Observable<Object>;

  abstract getAvailableCreatePlanningYears():Observable<Object>;
  abstract getAvailableOpenPlanningYears():Observable<Object>;
  abstract getMissionPrioritiesYears():Observable<Object>;
  abstract getMissionPriorities(year:string):Observable<Object>;
  abstract openPOM():Observable<Object>;
}