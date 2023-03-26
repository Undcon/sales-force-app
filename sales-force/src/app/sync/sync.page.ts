import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Customer, CustomerService } from '../core/entity/customer/customer.service';

import { v4 as uuidv4 } from 'uuid';
import { StateService } from '../core/entity/state/state.service';
import { CityService } from '../core/entity/city/city.service';
import { TablePriceService } from '../core/entity/table-price/table-price.service';
import { TableTimeService } from '../core/entity/table-time/table-time.service';
import { OrderService } from '../core/entity/order/order.service';

@Component({
  selector: 'app-sync',
  templateUrl: './sync.page.html',
  styleUrls: ['./sync.page.scss'],
})
export class SyncPage implements OnInit {

  public isIos = false;

  public step = 'Sincronizando clientes';

  constructor(
    private platform: Platform,
    private router: Router,
    private dbService: NgxIndexedDBService,
    private customerService: CustomerService,
    private stateService: StateService,
    private cityService: CityService,
    private tablePriceService: TablePriceService,
    private tableTimeService: TableTimeService,
    private orderService: OrderService
  ) { }

  ngOnInit() {
    this.isIos = this.platform.is('ios');
  }

  ionViewWillEnter() {
    if (navigator.onLine) {
      this.load();
    } else {
      this.router.navigate(['/', 'features', 'tab1']);
    }
  }

  private async load() {
    const lastSyncs = await this.dbService.getAll('sale_force_last_sync').toPromise() as any[];
    let lastSync = new Date();
    if (lastSyncs?.length) {
      lastSync = new Date(lastSyncs[0].date);
      lastSyncs[0].date = new Date();
      await this.dbService.update('sale_force_last_sync', lastSyncs[0]);
    } else {
      await this.dbService.add('sale_force_last_sync', {
        id: uuidv4(),
        date: new Date().toJSON()
      });
    }
    await this.loadCustomer();
    await this.loadState();
    await this.loadCity();
    await this.loadTablePrice();
    await this.loadTableTime();
    await this.syncTablePriceProduct();
    await this.loadKit();
    await this.loadProducts();
    this.router.navigate(['/', 'features', 'tab1']);
  }

  private async loadKit() {
    this.step = 'Sincronizando kit de produtos';
    const kits = await this.orderService.getProductKit().toPromise() as any;
    await this.dbService.clear('sale_force_table_price').toPromise();
    for (const kit of kits.content) {
      const itens = await this.orderService.getProductKitItens(kit.id).toPromise() as any;
      kit.items = itens.content;
      await this.dbService.add('sale_force_product_kit', kit).toPromise();
    }
  }

  private async loadProducts() {
    this.step = 'Sincronizando pedidos';
    const orders = await this.orderService.getAll().toPromise() as any;
    for (const order of orders.content) {
      this.dbService.getByID('sale_force_product', order.id.toString()).subscribe(async item => {
        try {
          order.id = order.id.toString();
          order.sync = true;
          order.tablePrice = order.tableOfPrice;
          order.tablePaymentTerm = order.tableOfPaymentTerm;
          order.observation = order.observations;
          debugger
          if (item) {
            await this.dbService.update('sale_force_product', order).toPromise();
          } else {
            await this.dbService.add('sale_force_product', order).toPromise();
          }
        } catch (err) {
          console.log(err);
        }
      });
    }
  }

  private async loadTableTime() {
    this.step = 'Sincronizando tabela de prazo';
    await this.dbService.clear('sale_force_table_time').toPromise();
    const table = await this.tableTimeService.getAll(0).toPromise() as any;
    await this.insertTableTime(table.content);
    for (let i = 1; i < table.totalPages; i++) {
      const tableFor = await this.tableTimeService.getAll(i).toPromise() as any;
      this.insertTableTime(tableFor.content);
    }
  }

  private async insertTableTime(table: any[]) {
    if (table) {
      for (const t of table) {
        await this.dbService.add('sale_force_table_time', t).toPromise();
      }
    }
  }

  private async syncTablePriceProduct() {
    this.step = 'Sincronizando produtos da tabela de preço';
    await this.dbService.clear('sale_force_table_price_product').toPromise();
    const tables = await this.dbService.getAll('sale_force_table_price').toPromise() as any[];
    for (const table of tables) {
      const products = await this.tablePriceService.getAllProduct(table.id).toPromise() as any;
      for (const product of products.content) {
        product.tableId = table.id;
        await this.dbService.add('sale_force_table_price_product', product).toPromise();
      }
    }
  }

  private async loadTablePrice() {
    this.step = 'Sincronizando tabela de preço';
    try {
      await this.dbService.clear('sale_force_table_price').toPromise();
      const table = await this.tablePriceService.getAll(0).toPromise() as any;
      await this.insertTable(table);
    } catch (err) {
      alert('Ocorreu um erro em relação ao usuário representante, entre em contato com o administrador');
    }
  }

  private async insertTable(table: any[]) {
    if (table) {
      for (const t of table) {
        await this.dbService.add('sale_force_table_price', t).toPromise();
      }
    }
  }

  private async loadCity() {
    this.step = 'Sincronizando cidades';
    await this.dbService.clear('sale_force_city').toPromise();
    const city = await this.cityService.getAll(0).toPromise() as any;
    this.insertCity(city.content);
    for (let i = 1; i < city.totalPages; i++) {
      const cityFor = await this.cityService.getAll(i).toPromise() as any;
      this.insertCity(cityFor.content);
    }
  }

  private async insertCity(cities: Customer[]) {
    if (cities) {
      for (const city of cities) {
        await this.dbService.add('sale_force_city', city).toPromise();
      }
    }
  }

  private async loadState() {
    this.step = 'Sincronizando estados';
    const state = await this.stateService.getAll(0).toPromise() as any;
    await this.dbService.clear('sale_force_state').toPromise();
    for (const s of state.content) {
      await this.dbService.add('sale_force_state', s).toPromise();
    }
  }

  private async loadCustomer() {
    const customer = await this.customerService.getAll(0).toPromise() as any;
    this.insertCustomer(customer.content);
    for (let i = 1; i < customer.totalPages; i++) {
      const customerFor = await this.customerService.getAll(i).toPromise() as any;
      this.insertCustomer(customerFor.content);
    }
  }

  private async insertCustomer(customers: Customer[]) {
    if (customers) {
      for (const customer of customers) {
        this.dbService.getByID('sale_force_customer', customer.id.toString()).subscribe(async c => {
          try {
            customer.id = customer.id.toString();
            customer.sync = true;
            if (c) {
              await this.dbService.update('sale_force_customer', customer).toPromise();
            } else {
              await this.dbService.add('sale_force_customer', customer).toPromise();
            }
          } catch (err) {
            console.log(err);
          }
        });
      }
    }
  }

}
