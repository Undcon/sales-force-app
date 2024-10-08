import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TableTimeService {

  constructor(
    private http: HttpClient
  ) { }

  public getAll(page = 0) {
    return this.http.get(`${environment.url}/tablepaymentterm?page=${page}&size=500`);
  }

  public getAllProduct(tablePrice: string) {
    return this.http.get(`${environment.url}/tablepaymentterm/${tablePrice}/itens?filter=table.id=${tablePrice}&page=0&size=50000`)
  }
}
