import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Customer, CustomerService } from '../core/entity/customer/customer.service';

import { v4 as uuidv4 } from 'uuid';
import { StateService } from '../core/entity/state/state.service';
import { CityService } from '../core/entity/city/city.service';

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
    private cityService: CityService
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
    this.router.navigate(['/', 'features', 'tab1'])
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
