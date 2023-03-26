import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(
    private http: HttpClient
  ) { }

  public create(payload: Customer) {
    return this.http.post(`${environment.url}/customers`, payload);
  }

  public update(payload: Customer) {
    return this.http.put(`${environment.url}/customers/${payload.id}`, payload);
  }

  public getAll(page = 0) {
    return this.http.get(`${environment.url}/customers?page=${page}&size=500`);
  }

}

export interface Customer {
  id: string;
  name: string;
  state: { id: string, name: string },
  city: { id: string, name: string },
  district: string;
  address: string;
  phone: string;
  phone2: string;
  phone3: string;
  cpfCnpj: string;
  registerDate: string;
  birthDate: string;
  addressNumber: string;
  complement: string;
  cep: string;
  rg: string;
  email: string;
  motherName: string;
  sync: boolean;
  error: any;
}