import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  public isIos = false;
  public logs = [] as any[]

  constructor(
    private platform: Platform,
    private dbService: NgxIndexedDBService
  ) {}

  ngOnInit() {
    this.isIos = this.platform.is('ios');
  }

  ionViewWillEnter() {
    this.dbService.getAll('sale_force_log').subscribe((log: any[]) => {
      debugger
      this.logs = log;
    });
  }

  public deleteNotification(id: string) {
    this.dbService.delete('sale_force_log', id).subscribe();
  }

}
