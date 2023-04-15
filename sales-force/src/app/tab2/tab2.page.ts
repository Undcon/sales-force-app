import { Component, OnInit } from '@angular/core';
import { AlertController, Platform, ToastController } from '@ionic/angular';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { OrderService } from '../core/entity/order/order.service';
import { SyncService } from '../core/entity/sync/sync.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  public isIos = false;

  public customerFilter = '';

  public product = [] as any[];
  public _product = [] as any[];

  constructor(
    private platform: Platform,
    private dbService: NgxIndexedDBService,
    private alertController: AlertController,
    private syncService: SyncService,
    private orderService: OrderService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.syncService.getOrderSync().subscribe(async () => {
      this._product = await this.dbService.getAll('sale_force_product').toPromise() as any[];
      this.product.forEach(i => {
        if (i.sync !== 1) {
          let item = this._product.find((i2: any) => i2.id === i.id);
          if (!item) {
            item = this._product.find((i2: any) => i2.oldid === i.id);
          }
          if (item?.sync) {
            i.id = item.id;
            i.sync = item.sync;
            i.error = item.error;
          }
        }
      });
    });
    this.isIos = this.platform.is('ios');
  }

  ionViewWillEnter() {
    this.dbService.getAll('sale_force_product').subscribe((products: any[]) => {
      this._product = products.sort((a: any, b: any) => { return (new Date(b.createdAt as any) as any - (new Date(a.createdAt as any) as any)) as any });
      this._product = this._product.sort((a: any, b: any) => {
        if (a.error) {
          return -1;
        } else if (a.sync == 0) {
          return -1;
        }
        return 0;
      });
      this.product = [];
      for (let i = 0; i < 100; i++) {
        if (this._product[i]) {
          this.product.push(this._product[i]);
        }
      }
    });
  }

  public onCustomerFilter() {
    if (this.customerFilter) {
      this.product = this._product.filter(p => p.customer && p.customer.name.toLowerCase().includes(this.customerFilter.toLocaleString()));
    } else {
      this.product = [];
      for (let i = 0; i < 100; i++) {
        if (this._product[i]) {
          this.product.push(this._product[i]);
        }
      }
    }
  }

  public async delete(id: string) {
    if (navigator.onLine) {
      const alert = await this.alertController.create({
        header: 'Remover pedido',
        message: 'Ao remover um pedido não será possível desfazer está operação!',
        buttons: [
          {
            text: 'Cancelar',
          },
          {
            text: 'Remover',
            cssClass: 'alert-button-confirm',
            handler: () => {
              if (!isNaN(id as any)) {
                this.orderService.delete(id).subscribe(() => {
                  this.dbService.deleteByKey('sale_force_product', id).subscribe();
                  this.product = this.product.filter(c => c.id !== id);
                  this._product = this._product.filter(c => c.id !== id);
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
        message: 'Somente é possível excluir um pedido se possuir internet!',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}
