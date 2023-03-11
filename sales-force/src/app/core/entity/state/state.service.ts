import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  constructor(
    private http: HttpClient
  ) { }

  public getAll(page = 0) {
    return this.http.get(`${environment.url}/states?page=${page}&size=500`);
  }
}
