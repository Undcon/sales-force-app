import { Injectable } from '@angular/core';

import { v4 as uuidv4 } from 'uuid';

import { AppComponent } from 'src/app/app.component';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor() { }

  public async createTable() {
    await AppComponent.DATABASE.executeSql('create table if not exists sales_force_session(id varchar(255) primary key, email varchar(255), password varchar(18))');
  }

  public async insert(session: Session) {
    await AppComponent.DATABASE.executeSql('insert into sales_force_session(id, email, password) values(?,?,?)', [uuidv4(), session.email, session.password]);
  }
}

export interface Session {
  email: string;
  password: string;
}