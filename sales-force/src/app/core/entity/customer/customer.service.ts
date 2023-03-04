import { Injectable } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor() { }

  public async createTable() {
    await AppComponent.DATABASE.executeSql('create table if not exists sales_force_customer(id varchar(255) primary key, name varchar(255), state varchar(255), city varchar(255)), district varchar(255), address varchar(255), phone varchar(255), phone2 varchar(255), phone3 varchar(255), cpfCnpj varchar(255), registerDate varchar(255), birthDate varchar(255), addressNumber varchar(255), complement varchar(255), cep varchar(255), rg varchar(255), email varchar(255), motherName varchar(255)');
  }

  public async getAll(): Promise<Customer[]> {
    const customersData = await AppComponent.DATABASE.executeSql('select * from sales_force_customer');
    console.log(customersData.rows);
    const customersRows = customersData.rows;
    const customers = [] as Customer[];
    console.log('lenght', customersRows.length);
    for (let i = 0; i < customersRows.length; i++) {
      customers.push(customersRows.itens(i));
    }
    return customers;
  }
}

export interface Customer {
  id: string;
  name: string;
  state: {id: string, name: string},
  city: {id: string, name: string},
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
}