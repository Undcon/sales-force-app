import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TablePriceService {

  constructor(
    private http: HttpClient
  ) { }

  public getAll(page = 0) {
    return this.http.get(`${environment.url}/tableprice?page=${page}&size=500`)
  }

  public getAllProduct(tablePrice: string) {
    return this.http.get(`${environment.url}/tableprice/${tablePrice}/itensProducts?filter=table.id=${tablePrice}&page=0&size=50000`)
  }
}
