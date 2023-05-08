import { Component, OnInit } from '@angular/core';
import { SyncService } from '../core/entity/sync/sync.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  public notification = 0;

  constructor(
    private syncService: SyncService
  ) { }

  ngOnInit(): void {
    this.syncService.errorSubs().subscribe(() => {
      this.notification++;
    });
  }

  public resetCount() {
    this.notification = 0;
  }

}
