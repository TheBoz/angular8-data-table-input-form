import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company } from '../models/company';

@Injectable({
  providedIn: 'root'
})
export class BackEndService {

  private dataURL = 'assets/data/company.json';

  constructor(private http: HttpClient) {
  }

  public getCompanyData(): Observable<Company[]> {
    return this.http.get(this.dataURL) as Observable<Company[]>;
  }}
