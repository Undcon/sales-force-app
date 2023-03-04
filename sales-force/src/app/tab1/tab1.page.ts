import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../core/entity/customer/customer.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  constructor(
    private customerService: CustomerService
  ) {}

  ngOnInit() {
    console.error('aqui');
    alert('aqui');
    this.customerService.getAll().then(customers => {
      console.log(customers);
    }).catch(err => {
      console.log(err);
      
    });
  }

}
