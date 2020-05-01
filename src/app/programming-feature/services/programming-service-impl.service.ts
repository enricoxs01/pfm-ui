import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProgrammingService } from './programming-service';
import { Program } from '../models/Program';

@Injectable({
  providedIn: 'root'
})
export class ProgrammingServiceImpl extends ProgrammingService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getPRsForContainer(containerId: string, organizationId?: string): Observable<object> {
    organizationId = organizationId ? organizationId : '';
    return this.get('program/container/' + containerId, new HttpParams().set('organizationId', organizationId));
  }

  getBaBlinSummary(containerId: string, organizationId?: string): Observable<object> {
    return this.get(
      'program/ba-blin-summary/container/' + containerId,
      organizationId != null ? new HttpParams().set('organizationId', organizationId) : null
    );
  }

  processPRsForContainer(containerId: string, action: string, organizationId?: string, skipToaValidation?: boolean) {
    organizationId = organizationId ? organizationId : '';
    const params: HttpParams = new HttpParams()
      .set('action', action)
      .set('organizationId', organizationId)
      .set('skipToaValidation', '' + !!skipToaValidation);
    return this.put('program/container/' + containerId + '/process', null, params);
  }

  getPermittedOrganizations() {
    return this.get('program/permittedOrganizations');
  }

  findByShortNameAndContainerId(shortName: string, containerId: string) {
    return this.get('program/name/' + shortName + '/container/' + containerId);
  }

  getPRForYearAndShortName(year: number, shortName: string) {
    const params: HttpParams = new HttpParams().set('shortName', shortName);
    return this.get('program/year/' + year + '/program', params);
  }

  getProgramById(id: string) {
    return this.get('program/' + id);
  }

  updateProgram(program: Program) {
    return this.put('program/', program);
  }

  create(program: Program) {
    return this.post('program', program);
  }

  save(program: Program) {
    return this.put('program/save', program);
  }

  approve(program: Program) {
    return this.put('program/approve', program);
  }

  reject(program: Program) {
    return this.put('program/reject', program);
  }
}
