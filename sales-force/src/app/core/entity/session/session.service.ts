import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(
    private http: HttpClient
  ) { }

  public login(payload: Session) {
    return this.http.post(`${environment.url}/login`, {
      login: payload.email,
      password: payload.password
    }, {
      headers: {
        xom: 'https://app.undcon.com.br'
      }
    });
  }
}

export interface Session {
  email: string;
  password: string;
}