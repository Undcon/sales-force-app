import { Component, OnInit } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { NgxIndexedDBService } from 'ngx-indexed-db';

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
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.isIos = this.platform.is('ios');
  }

  ionViewWillEnter() {
    this.dbService.getAll('sale_force_product').subscribe((products: any[]) => {
      this._product = products.sort((a: any, b: any) => { return (new Date(b.createdAt as any) as any - (new Date(a.createdAt as any) as any)) as any });
      this.product = [];
      for(let i = 0; i < 100; i++) {
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
      for(let i = 0; i < 100; i++) {
        if (this._product[i]) {
          this.product.push(this._product[i]);
        }
      }
    }
  }

  public async delete(id: string) {
    const alert = await this.alertController.create({
      header: 'Remover peido',
      message: 'Ao remover um pedido não será possível desfazer está operação!',
      buttons: [
        {
          text: 'Cancelar',
        },
        {
          text: 'Remover',
          cssClass: 'alert-button-confirm',
          handler: () => {
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
