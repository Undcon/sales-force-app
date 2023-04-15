import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { SyncService } from './core/entity/sync/sync.service';
import { Platform } from '@ionic/angular';

import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  providers: [StatusBar]
})
export class AppComponent implements OnInit {

  public static DATABASE: SQLiteObject;

  constructor(
    private dbService: NgxIndexedDBService,
    private router: Router,
    private syncService: SyncService,
    private cdr: ChangeDetectorRef,
    private statusBar: StatusBar,
    private platform: Platform
  ) { }

  ngOnInit(): void {
    setInterval(async () => {
      await this.syncService.sync();
      this.cdr.detectChanges();
    }, 10000);
    this.platform.ready().then(() => {
      this.statusBar.overlaysWebView(false);
      this.statusBar.backgroundColorByHexString('#ffffff');
      this.statusBar.styleDefault();
    });
  }
}
