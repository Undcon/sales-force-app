import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  public static DATABASE: SQLiteObject;

  constructor(
    private dbService: NgxIndexedDBService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.dbService.getAll('sale_force_session').subscribe(session => {
      if (session?.length) {
        this.router.navigate(['/', 'sync']);
      }
    });
  }
}
