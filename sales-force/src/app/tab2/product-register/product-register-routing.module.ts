import { Injectable, NgModule } from '@angular/core';
import { Routes, RouterModule, Resolve } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Customer } from 'src/app/core/entity/customer/customer.service';

import { ProductRegisterPage } from './product-register.page';

@Injectable({ providedIn: 'root' })
export class CustomerAllResolver implements Resolve<Customer> {
  constructor(private dbService: NgxIndexedDBService) { }

  resolve() {
    return this.dbService.getAll('sale_force_customer') as any;
  }
}

@Injectable({ providedIn: 'root' })
export class TablePriceAllResolver implements Resolve<any> {
  constructor(private dbService: NgxIndexedDBService) { }

  resolve() {
    return this.dbService.getAll('sale_force_table_price') as any;
  }
}

@Injectable({ providedIn: 'root' })
export class TableTimeAllResolver implements Resolve<any> {
  constructor(private dbService: NgxIndexedDBService) { }

  resolve() {
    return this.dbService.getAll('sale_force_table_time') as any;
  }
}

const routes: Routes = [
  {
    path: ':id',
    component: ProductRegisterPage,
    resolve: {
      customers: CustomerAllResolver,
      tablePrices: TablePriceAllResolver,
      tableTimes: TableTimeAllResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductRegisterPageRoutingModule { }
