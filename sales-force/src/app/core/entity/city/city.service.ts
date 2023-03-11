import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  constructor(
    private http: HttpClient
  ) { }

  public getAll(page = 0) {
    return this.http.get(`${environment.url}/cities?page=${page}&size=500`);
  }

  public loadCep(cep: string) {
    return this.http.get(`https://viacep.com.br/ws/${cep}/json`);
  }
}
