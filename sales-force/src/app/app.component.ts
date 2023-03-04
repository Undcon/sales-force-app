import { Component, OnInit } from '@angular/core';

import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { CustomerService } from './core/entity/customer/customer.service';
import { SessionService } from './core/entity/session/session.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  public static DATABASE: SQLiteObject;
  
  constructor(
    private platform: Platform,
    private sqlite: SQLite,
    private sessionService: SessionService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.platform.ready().then(() => {
      this.sqlite.selfTest().then(() => {
        this.sqlite.create({
          name: 'sales_force.db',
          location: 'default'
        })
        .then(async database => {
          AppComponent.DATABASE = database;
          await this.sessionService.createTable();
          await this.customerService.createTable();
        })
        .catch(err => {
          console.log(err);
          
          alert('Não foi possível uma conexão com o SQL, contate o suporte!');
        });
      });
    });
  }
}
