import { Component, OnInit } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Customer } from '../core/entity/customer/customer.service';
import { SyncService } from '../core/entity/sync/sync.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  public isIos = false;

  private _customers = [] as Customer[];
  public customers = [] as Customer[];

  public filterField = '';

  public page = 1;

  constructor(
    private platform: Platform,
    private dbService: NgxIndexedDBService,
    private alertController: AlertController,
    private syncService: SyncService
  ) { }

  ngOnInit() {
    this.isIos = this.platform.is('ios');
    this.syncService.getCustomerSync().subscribe(customer => {
      this._customers.forEach(c => {
        if (c.id == customer.oldid) {
          c.id = customer.id.toString();
          c.sync = true;
        }
      });
      this.customers.forEach(c => {
        if (c.id == customer.id) {
          c.id = customer.id.toString();
          c.sync = true;
        }
      });
      this.page = 1;
    });
  }

  ionViewWillEnter() {
    this.dbService.getAll('sale_force_customer').subscribe((customers: any[]) => {
      this._customers = customers;
      this.customers = [];
      for (let i = 0; i < 100; i++) {
        if (this._customers[i]) {
          if (this._customers[i]) {
            this.customers.push(this._customers[i]);
          }
        }
      }
      this.page = 1;
    });
  }

  public loadMore(event: any) {
    this.page ++;
    for (let i = ((100 * this.page) - 100); i < (100 * this.page); i++) {
      if (this._customers[i]) {
        if (this._customers[i]) {
          this.customers.push(this._customers[i]);
        }
      }
    }
    event.target.complete();
  }

  public filter() {
    if (this.filterField) {
      this.customers = this._customers.filter(c => c.name.toLowerCase().includes(this.filterField.toLowerCase()));
    } else {
      this.customers = [];
      for (let i = 0; i < 100; i++) {
        if (this._customers[i]) {
          if (this._customers[i]) {
            this.customers.push(this._customers[i]);
          }
        }
      }
    }
    this.page = 1;
  }

  public async delete(id: any) {
    const alert = await this.alertController.create({
      header: 'Remover cliente',
      message: 'Ao remover um cliente não será possível desfazer está operação!',
      buttons: [
        {
          text: 'Cancelar',
        },
        {
          text: 'Remover',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.dbService.deleteByKey('sale_force_customer', id).subscribe();
            this.customers = this.customers.filter(c => c.id !== id);
          }
        },
      ],
    });

    await alert.present();
  }

}
