import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    private http: HttpClient
  ) { }

  public create(order: any) {
    const payload = JSON.parse(JSON.stringify(order));
    payload.tableOfPrice = payload.tablePrice;
    delete payload.tablePrice;
    payload.tableOfPaymentTerm = payload.tablePaymentTerm;
    delete payload.tablePaymentTerm;
    payload.observations = payload.observation
    delete payload.items;
    return this.http.post(`${environment.url}/salesOrders`, payload);
  }

  public update(order: any) {
    const payload = JSON.parse(JSON.stringify(order));
    payload.tableOfPrice = payload.tablePrice;
    delete payload.tablePrice;
    payload.tableOfPaymentTerm = payload.tablePaymentTerm;
    delete payload.tablePaymentTerm;
    payload.observations = payload.observation
    delete payload.items;
    return this.http.put(`${environment.url}/salesOrders/${payload.id}`, payload);
  }

  public addItem(item: any, salesOrder: any) {
    const payload = JSON.parse(JSON.stringify(item));
    delete payload.id;
    payload.type = 'PRODUCT_KIT';
    payload.productKit = {
      id: payload.name.id
    };
    payload.salesOrder = {
      id: salesOrder
    };
    delete payload.name;
    return this.http.post(`${environment.url}/salesOrders/${salesOrder}/itens`, payload);
  }

}

export interface Order {
  id?: string;
  customer: { id: string };
  tableOfPrice: { id: string };
  tableOfPaymentTerm: { id: string };
  observations: string;
}