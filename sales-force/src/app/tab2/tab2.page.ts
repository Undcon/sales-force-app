import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { OrderService } from '../core/entity/order/order.service';
import { SyncService } from '../core/entity/sync/sync.service';
import { Router } from '@angular/router';

import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  providers: [FileOpener, FileTransfer, File, InAppBrowser]
})
export class Tab2Page implements OnInit {

  public isIos = false;

  public customerFilter = '';

  public product = [] as any[];
  public _product = [] as any[];
  public tablePriceProduct = [] as any[];
  public productsKit = [] as any[]
  public page = 1;

  constructor(
    private platform: Platform,
    private dbService: NgxIndexedDBService,
    private alertController: AlertController,
    private syncService: SyncService,
    private orderService: OrderService,
    private toastController: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private router: Router,
    private fileOpener: FileOpener,
    private transfer: FileTransfer, 
    private file: File,
    private iab: InAppBrowser
  ) { }

  ngOnInit() {
    this.syncService.getOrderSync().subscribe(async () => {
      this._product = await this.dbService.getAll('sale_force_product').toPromise() as any[];
      this._product.sort((a: any, b: any) => b.sync - a.sync);
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
    this.dbService.getAll('sale_force_product_kit').subscribe(productsKit => {
      this.productsKit = productsKit;
      this.dbService.getAll('sale_force_product').subscribe((products: any[]) => {
        this._product = products.sort((a: any, b: any) => { return (new Date(b.createdAt as any) as any - (new Date(a.createdAt as any) as any)) as any });
        this._product = this._product.sort((a: any, b: any) => {
          if (a.error) {
            return -1;
          } else if (a.sync == 0 || a.sync == -1) {
            return -1;
          }
          return b.id - a.id;
        });
        this.product = [];
        for (let i = 0; i < 100; i++) {
          if (this._product[i]) {
            this._product[i].total = this.getTotalOrder(this._product[i]);
            this._product[i].unit = '';
            let productsQty = 0;
            this._product[i]?.items?.forEach((item: any) => {
              // Soma a quantidade de peças de cada item do pedido
              if(item.type === 'PRODUCT'){
                productsQty += item.quantity;
                this._product[i].unit = item?.name?.unit;
              } else {
                //Calcula a quantidade de peças de cada Kit
                let totalProducts = 0;
                const itens = productsKit.find((p: any) => p.id === item?.name.id) as any;
                itens?.items?.forEach((i2: any) => {
                  totalProducts += i2.quantity;
                });
                productsQty += (totalProducts * item.quantity);
              }
              this._product[i].itemType = item.type;
            });
            this._product[i].productsQty = productsQty;
            this.product.push(this._product[i]);
          }
        }
        this.page = 1;
      });
    });
  }

  private getTotalOrder(order: any) {
    let total = 0;
    order.items?.forEach((i: any) => {
      total += (i.price * i.quantity);
    });
    if (order.discountPercentInput) {
      return (total - (total * (order.discountPercentInput / 100)));
    } else {
      return total;
    }
  }

  async presentActionSheet(id: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opções do pedido',
      mode: 'ios',
      buttons: [
        {
          text: 'Editar pedido',
          handler: () => {
            this.router.navigate(['/', 'features', 'tab2', 'product-register', id]);
          },
        },
        {
          text: 'Gerar PDF',
          handler: async () => {
            if (!isNaN(id as any)) {
              actionSheet.dismiss();
              const loading = await this.loadingCtrl.create({
                message: 'Aguarde...',
              });
              loading.present();
              try {
                const url = await this.orderService.generatePdf(id).toPromise() as any;
                const fileTransfer: FileTransferObject = this.transfer.create();
                const name = this.file.dataDirectory + `Pedido - ${id}.pdf`;
                if (this.platform.is('ios')) {
                  this.iab.create(url.url, '_system');
                } else  {
                  await fileTransfer.download(url.url, name);
                  this.fileOpener.showOpenWithDialog(name, 'application/pdf').then(() => {}).catch(err => alert(JSON.stringify(err)));
                }
              } catch (err) {
                alert('Ocorreu um erro!');
              }
              loading.dismiss();
            } else {
              const alert = await this.alertController.create({
                header: 'Alerta',
                message: 'Somente é possível gerar PDF de um pedido já enviado!',
                backdropDismiss: false,
                buttons: ['OK']
              });
              await alert.present();
            }
          },
        },
        {
          text: 'Remover pedido',
          role: 'destructive',
          handler: () => {
            this.delete(id);
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        },
      ],
    });

    await actionSheet.present();
  }

  public loadMore(event: any) {
    this.page++;
    for (let i = ((100 * this.page) - 100); i < (100 * this.page); i++) {
      if (this._product[i]) {
        if (this._product[i]) {
          this._product[i].total = this.getTotalOrder(this._product[i]);
          this.product.push(this._product[i]);
        }
      }
    }
    event.target.complete();
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

  public parseCurrency(value: number) {
    return value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
  }

  public async delete(id: string) {
    if (!isNaN(id as any)) {
      const alert = await this.alertController.create({
        header: 'Alerta',
        message: 'Somente é possível excluir um pedido não enviados!',
        backdropDismiss: false,
        buttons: ['OK']
      });
      return await alert.present();
    }
    const alert = await this.alertController.create({
      header: 'Remover pedido',
      message: 'Ao remover um pedido não será possível desfazer está operação!',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
        },
        {
          text: 'Remover',
          cssClass: 'alert-button-confirm',
          handler: async () => {
            this.dbService.deleteByKey('sale_force_product', id).subscribe();
            this.product = this.product.filter(c => c.id !== id);
            this._product = this._product.filter(c => c.id !== id);
          }
        },
      ],
    });

    await alert.present();
  }
}
