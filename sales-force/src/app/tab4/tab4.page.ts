import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {

  public user = null as any;

  public itemType = 'kit';

  constructor(
    private router: Router,
    private dbService: NgxIndexedDBService
  ) { }

  ngOnInit() {
    this.dbService.getAll('sale_force_session').subscribe(session => {
      this.user = session[0];
    });
    var type = localStorage.getItem('itemType');
    if(type){
      this.itemType = type;
    }
  }

  async logoff() {
    localStorage.clear();
    this.dbService.clear('sale_force_session').subscribe(() => {
      this.router.navigate(['/']);
    });
    this.dbService.clear('sale_force_customer').subscribe();
    this.dbService.clear('sale_force_last_sync').subscribe();
    this.dbService.clear('sale_force_log').subscribe();
    this.dbService.clear('sale_force_table_price').subscribe();
    this.dbService.clear('sale_force_table_time').subscribe();
    this.dbService.clear('sale_force_product').subscribe();
    this.dbService.clear('sale_force_product_kit').subscribe();
    this.dbService.clear('sale_force_table_time_product').subscribe();
  }

  public onSegmentChange(event: any) {
    this.itemType = event.detail.value;
    localStorage.setItem('itemType', this.itemType);
  }

}
