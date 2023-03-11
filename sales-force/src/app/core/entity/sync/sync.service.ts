import { EventEmitter, Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { CustomerService } from '../customer/customer.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  private error = new EventEmitter();

  private customerSync = new EventEmitter();

  constructor(
    private dbService: NgxIndexedDBService,
    private custormService: CustomerService
  ) { }

  public errorSubs() {
    return this.error.asObservable();
  }

  public getCustomerSync() {
    return this.customerSync.asObservable();
  }

  public async sync() {
    await this.syncCustomer();
  }

  private async syncCustomer() {
    try {
      const customers = await this.dbService.getAllByIndex('sale_force_customer', 'sync', IDBKeyRange.only(0)).toPromise() as any[];
      for (const customer of customers) {
        if (isNaN(customer.id)) {
          customer.oldid = customer.id;
          delete customer.id;
          try {
            const c = await this.custormService.create(customer).toPromise() as any;
            await this.dbService.delete('sale_force_customer', customer.oldid).toPromise();
            customer.id = c.id.toString();
            customer.sync = 1;
            await this.dbService.add('sale_force_customer', customer).toPromise();
            this.customerSync.emit({
              oldid: customer.oldid,
              id: customer.id
            });
          } catch (err: any) {
            this.error.emit(1);
            customer.sync = 1;
            customer.id = customer.oldid;
            customer.error = err.error?.message ? err.error?.message : JSON.stringify(err.error);
            if (err.status === 0) {
              customer.error = 'O servidores não estão disponíveis, não se preocupe, tentaremos novamente mais tarde.'
            }
            await this.dbService.update('sale_force_customer', customer).toPromise();
            await this.dbService.add('sale_force_log', {
              log: `Erro ao inserir o cliente ${customer.name}`,
              id: customer.oldid,
              type: 'customer'
            }).toPromise();
          }
        } else {
          customer.sync = 1;
          try {
            await this.custormService.update(customer).toPromise() as any;
            customer.id = customer.id.toString();
            await this.dbService.update('sale_force_customer', customer).toPromise();
          } catch (err: any) {
            this.error.emit(1);
            customer.id = customer.id.toString();
            customer.error = err.error?.message ? err.error?.message : JSON.stringify(err.error);
            if (err.status === 0) {
              customer.error = 'O servidores não estão disponíveis, não se preocupe, tentaremos novamente mais tarde.'
            }
            await this.dbService.update('sale_force_customer', customer).toPromise();
            await this.dbService.add('sale_force_log', {
              log: `Erro ao atualizar o cliente ${customer.name}`,
              id: customer.oldid,
              type: 'customer'
            }).toPromise();
          }
        }
      }
    } catch (err) { }
  }

}
