import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { Program } from '../models/Program';

export abstract class MrdbService extends BaseRestService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  /**
   * Get Programs from master program list by id
   *
   * @param mrId - Existing Mrdb Program Id
   */
  abstract getById(mrId: string): Observable<any>;

  /**
   * Get Programs from master program list by Short Name
   *
   * @param shortName - Existing Mrdb Program Short Name
   */
  abstract getByName(shortName: string): Observable<any>;

  /**
   * Get Programs from master program list
   *
   * @param organizationId - Organization Id for filtering by organization, null for all
   */
  abstract getPrograms(organizationId: string): Observable<object>;

  /**
   * Get Programs from master program list and remove any Programs that match the passed in Program Requests
   *
   * @param organizationId - Organization Id for filtering by organization, null for all
   * @param pRs - Existing Program Requests to filter against
   */
  abstract getProgramsMinusPrs(organizationId: string, pRs: Program[]): Observable<object>;

  abstract getPrevFundedProgramsValidForUFR(): Observable<object>;

  abstract getProgramRequestValidForUFR(): Observable<object>;

  abstract getPRsAndMrdbPRsValidForUFR(): Observable<object>;
}
