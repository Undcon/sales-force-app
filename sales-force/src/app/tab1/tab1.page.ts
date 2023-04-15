import { Component, OnInit } from '@angular/core';
import { AlertController, Platform, ToastController } from '@ionic/angular';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Customer, CustomerService } from '../core/entity/customer/customer.service';
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
    private syncService: SyncService,
    private customerService: CustomerService,
    private toastController: ToastController
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
      this._customers = customers.sort((a: any, b: any) => {
        if (a.error) {
          return -1;
        } else if (a.sync == 0) {
          return -1;
        }
        return 0;
      });
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
    if (navigator.onLine) {
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
              if (!isNaN(id as any)) {
                this.customerService.delete(id).subscribe(() => {
                  this.dbService.deleteByKey('sale_force_customer', id).subscribe();
                  this.customers = this.customers.filter(c => c.id !== id);
                }, async err => {
                  const toast = await this.toastController.create({
                    message: err.error.message,
                    duration: 4500,
                    color: 'danger',
                    position: 'top'
                  });
              
                  await toast.present();
                });
              }
            }
          },
        ],
      });

      await alert.present();
    } else {
      const alert = await this.alertController.create({
        header: 'Alerta',
        message: 'Somente é possível excluir um cliente se possuir internet!',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

}
