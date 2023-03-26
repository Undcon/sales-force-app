import { EventEmitter, Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { CustomerService } from '../customer/customer.service';
import { Order, OrderService } from '../order/order.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  private error = new EventEmitter();

  private customerSync = new EventEmitter();
  private orderSync = new EventEmitter();

  constructor(
    private dbService: NgxIndexedDBService,
    private custormService: CustomerService,
    private orderService: OrderService
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
    await this.syncCustomer();
    await this.syncOrder();
  }

  private async syncOrder() {
    try {
      const orders = await this.dbService.getAllByIndex('sale_force_product', 'sync', IDBKeyRange.only(0)).toPromise() as any[];
      for (const order of orders) {
        if (isNaN(order.id as any)) {
          order.oldid = order.id;
          delete order.id;
          try {
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
            this.error.emit(1);
            order.sync = 1;
            order.id = order.oldid;
            order.error = err.error?.message ? err.error?.message : JSON.stringify(err.error);
            if (err.status === 0) {
              order.error = 'O servidores não estão disponíveis, não se preocupe, tentaremos novamente mais tarde.'
            }
            await this.dbService.update('sale_force_product', order).toPromise();
            await this.dbService.add('sale_force_log', {
              log: `Erro ao inserir pedido`,
              id: order.oldid,
              type: 'order'
            }).toPromise();
          }
        } else {
          order.sync = 1;
          try {
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
            this.error.emit(1);
            order.id = order.id.toString();
            order.sync = 1;
            order.error = err.error?.message ? err.error?.message : JSON.stringify(err.error);
            if (err.status === 0) {
              order.error = 'O servidores não estão disponíveis, não se preocupe, tentaremos novamente mais tarde.'
            }
            await this.dbService.update('sale_force_product', order).toPromise();
            await this.dbService.add('sale_force_log', {
              log: `Erro ao atualizar o pedido`,
              id: order.id,
              type: 'order'
            }).toPromise();
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
