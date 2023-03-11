import { Injectable, NgModule } from '@angular/core';
import { Routes, RouterModule, Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Customer } from 'src/app/core/entity/customer/customer.service';

import { CustomerRegisterPage } from './customer-register.page';

@Injectable({ providedIn: 'root' })
export class CustomerResolver implements Resolve<Customer> {
  constructor(private dbService: NgxIndexedDBService) {}

  resolve(
    route: ActivatedRouteSnapshot
  ) {
    if (route.paramMap.get('id') === 'new') {
      return null;
    }
    return this.dbService.getByID<any>('sale_force_customer', route.paramMap.get('id') as any) as any;
  }
}

const routes: Routes = [
  {
    path: ':id',
    component: CustomerRegisterPage,
    resolve: {
      customer: CustomerResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerRegisterPageRoutingModule {}
