import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db';
import { InterceptorService } from './core/interpector.service';

export function migrationFactory() {
  return {
    1: (db: any, transaction: any) => {
      const store = transaction.objectStore('sale_force_session');
      store.createIndex('sale_force_session', 'id', { unique: false });
    },
    2: (db: any, transaction: any) => {
      const store = transaction.objectStore('sale_force_customer');
      store.createIndex('sale_force_customer', 'id', { unique: true });
    },
    3: (db: any, transaction: any) => {
      const store = transaction.objectStore('sale_force_last_sync');
      store.createIndex('sale_force_last_sync', 'id', { unique: true });
    },
    4: (db: any, transaction: any) => {
      const store = transaction.objectStore('sale_force_state');
      store.createIndex('sale_force_city', 'id', { unique: true });
    }
  };
}

const dbConfig: DBConfig = {
  name: 'sale_force',
  version: 3,
  objectStoresMeta: [{
    store: 'sale_force_session',
    storeConfig: { keyPath: 'id', autoIncrement: false },
    storeSchema: [
      { name: 'email', keypath: 'email', options: { unique: false } },
      { name: 'password', keypath: 'password', options: { unique: false } },
      { name: 'token', keypath: 'token', options: { unique: false } }
    ]
  }, {
    store: 'sale_force_customer',
    storeConfig: { keyPath: 'id', autoIncrement: false },
    storeSchema: [
      { name: 'name', keypath: 'name', options: { unique: false } },
      { name: 'state', keypath: 'state', options: { unique: false } },
      { name: 'city', keypath: 'city', options: { unique: false } },
      { name: 'district', keypath: 'district', options: { unique: false } },
      { name: 'address', keypath: 'address', options: { unique: false } },
      { name: 'phone', keypath: 'phone', options: { unique: false } },
      { name: 'phone2', keypath: 'phone2', options: { unique: false } },
      { name: 'phone3', keypath: 'phone3', options: { unique: false } },
      { name: 'cpfCnpj', keypath: 'cpfCnpj', options: { unique: false } },
      { name: 'registerDate', keypath: 'registerDate', options: { unique: false } },
      { name: 'birthDate', keypath: 'birthDate', options: { unique: false } },
      { name: 'addressNumber', keypath: 'addressNumber', options: { unique: false } },
      { name: 'complement', keypath: 'complement', options: { unique: false } },
      { name: 'cep', keypath: 'cep', options: { unique: false } },
      { name: 'rg', keypath: 'rg', options: { unique: false } },
      { name: 'email', keypath: 'email', options: { unique: false } },
      { name: 'motherName', keypath: 'motherName', options: { unique: false } },
      { name: 'sync', keypath: 'sync', options: { unique: false } }
    ]
  }, {
    store: 'sale_force_last_sync',
    storeConfig: { keyPath: 'id', autoIncrement: false },
    storeSchema: [
      { name: 'date', keypath: 'date', options: { unique: false } }
    ]
  }, {
    store: 'sale_force_state',
    storeConfig: { keyPath: 'id', autoIncrement: false },
    storeSchema: [
      { name: 'initials', keypath: 'initials', options: { unique: false } },
      { name: 'name', keypath: 'name', options: { unique: false } }
    ]
  }, {
    store: 'sale_force_city',
    storeConfig: { keyPath: 'id', autoIncrement: false },
    storeSchema: [
      { name: 'ibgeCode', keypath: 'ibgeCode', options: { unique: false } },
      { name: 'name', keypath: 'name', options: { unique: false } }
    ]
  }],
  migrationFactory
};

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, NgxIndexedDBModule.forRoot(dbConfig), HttpClientModule, BrowserAnimationsModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SQLite,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
