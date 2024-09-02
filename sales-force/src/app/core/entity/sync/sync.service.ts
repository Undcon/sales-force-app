import { EventEmitter, Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { CustomerService } from '../customer/customer.service';
import { OrderService } from '../order/order.service';

import { Network } from '@awesome-cordova-plugins/network/ngx';

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  private static isSync = false;

  private error = new EventEmitter();

  private customerSync = new EventEmitter();
  private orderSync = new EventEmitter();

  constructor(
    private dbService: NgxIndexedDBService,
    private custormService: CustomerService,
    private orderService: OrderService,
    private network: Network
  ) { }

  public errorSubs() {
    return this.error.asObservable();
  }

  public getCustomerSync() {
    return this.customerSync.asObservable();
  }

  public getOrderSync() {
    return this.orderSync.asObservable();
  }

  public async sync() {
    if (this.network.type !== this.network.Connection.NONE && !SyncService.isSync) {
      SyncService.isSync = true;
      await this.syncCustomer();
      await this.syncOrder();
      SyncService.isSync = false;
    }
  }

  private async syncOrder() {
    try {
      const orders = await this.dbService.getAllByIndex('sale_force_product', 'sync', IDBKeyRange.only(0)).toPromise() as any[];
      for (const order of orders) {
        if (isNaN(order.id as any)) {
          order.oldid = order.id;
          delete order.id;
          order.tableOfPaymentTermItem = {};
          try {
            if (isNaN(order.customer.id)) {
              throw new Error('Aguardando o cadastro do cliente ser efetivado!');
            }
            const o = await this.orderService.create(order).toPromise() as any;
            order.id = o.id.toString();
            order.sync = 1;
            if (order.items) {
              for (let item of order.items) {
                const response = await this.orderService.addItem(item, order.id).toPromise() as any;
                item.id = response.id;
              }
            }
            await this.dbService.add('sale_force_product', order).toPromise();
            await this.dbService.delete('sale_force_product', order.oldid).toPromise();
          } catch (err: any) {
            order.sync = 1;
            order.id = order.oldid;
            order.error = err.error?.message ? err.error?.message : JSON.stringify(err.error);
            if (err.message && err.status === 0) {
              order.error = err.message;
              order.sync = 0;
            } else if (err instanceof Error) {
              order.error = err.message;
            }
            if (err.status !== 0) {
              await this.dbService.update('sale_force_product', order).toPromise();
              if (order.sync !== 0) {
                this.error.emit(1);
                await this.dbService.add('sale_force_log', {
                  log: `Erro ao inserir pedido`,
                  id: order.oldid,
                  type: 'order'
                }).toPromise();
              }
            }
          }
        } else {
          order.sync = 1;
          try {
            if (isNaN(order.customer.id)) {
              throw new Error('Aguardando o cadastro do cliente ser efetivado!');
            }
            await this.orderService.update(order).toPromise() as any;
            order.id = order.id.toString();
            if (order?.deleteds?.length) {
              for (let deleted of order.deleteds) {
                await this.orderService.deleteItem(order.id, deleted).toPromise();
              }
              order.deleteds = [];
            }
            if (order.items) {
              for (let item of order.items) {
                if (item.sync === 0) {
                  if (isNaN(item.id)) {
                    const response = await this.orderService.addItem(item, order.id).toPromise() as any;
                    item.id = response.id;
                  }
                }
              }
            }
            await this.dbService.update('sale_force_product', order).toPromise();
          } catch (err: any) {
            order.id = order.id.toString();
            order.sync = 1;
            order.error = err.error?.message ? err.error?.message : JSON.stringify(err.error);
            if (err.status !== 0) {
              this.error.emit(1);
              await this.dbService.update('sale_force_product', order).toPromise();
              await this.dbService.add('sale_force_log', {
                log: `Erro ao atualizar o pedido`,
                id: order.id,
                type: 'order'
              }).toPromise();
            }
          }
        }
      }
      this.orderSync.emit();
    } catch (err) {
      console.log(err);

    }
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
            this.dbService.getAll('sale_force_product').subscribe()
            const orders = await this.dbService.getAllByIndex('sale_force_product', 'sync', IDBKeyRange.only(0)).toPromise() as any[];
            for (let order of orders) {
              if (order.error === 'Aguardando o cadastro do cliente ser efetivado!' && order.customer.id === customer.oldid) {
                order.customer.id = customer.id;
                order.status = 0;
                order.error = null;
                await this.dbService.update('sale_force_product', order).toPromise();
              }
            }
            this.customerSync.emit({
              oldid: customer.oldid,
              id: customer.id
            });
          } catch (err: any) {
            customer.sync = 1;
            customer.id = customer.oldid;
            customer.error = err.error?.message ? err.error?.message : JSON.stringify(err.error);
            if (err.status !== 0) {
              this.error.emit(1);
              await this.dbService.update('sale_force_customer', customer).toPromise();
              await this.dbService.add('sale_force_log', {
                log: `Erro ao inserir o cliente ${customer.name}`,
                id: customer.oldid,
                type: 'customer'
              }).toPromise();
            }
          }
        } else {
          customer.sync = 1;
          try {
            await this.custormService.update(customer).toPromise() as any;
            customer.id = customer.id.toString();
            await this.dbService.update('sale_force_customer', customer).toPromise();
          } catch (err: any) {
            customer.id = customer.id.toString();
            customer.error = err.error?.message ? err.error?.message : JSON.stringify(err.error);
            if (err.status !== 0) {
              this.error.emit(1);
              await this.dbService.update('sale_force_customer', customer).toPromise();
              await this.dbService.add('sale_force_log', {
                log: `Erro ao atualizar o cliente ${customer.name}`,
                id: customer.oldid,
                type: 'customer'
              }).toPromise();
            }
          }
        }
      }
    } catch (err) { }
  }

}
