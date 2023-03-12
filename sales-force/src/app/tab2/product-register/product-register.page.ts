import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Customer } from 'src/app/core/entity/customer/customer.service';

import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-product-register',
  templateUrl: './product-register.page.html',
  styleUrls: ['./product-register.page.scss'],
})
export class ProductRegisterPage implements OnInit {

  public isIos = false;

  public segment = 'product';

  public _customers = [] as Customer[];
  public customers = [] as Customer[];
  public customerFilter = '';

  public _tablePrices = [] as any[];
  public tablePrices = [] as any[];
  public tablePriceFilter = '';

  public _tableTimes = [] as any[];
  public tableTimes = [] as any[];
  public tableTimesFilter = '';

  public form: FormGroup;

  constructor(
    private platform: Platform,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dbService: NgxIndexedDBService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.isIos = this.platform.is('ios');
    this.form = this.formBuilder.group({
      id: [],
      customer: [],
      tablePrice: [],
      tablePaymentTerm: [],
      observation: []
    });
  }

  ionViewWillEnter() {
    this._customers = this.activatedRoute.snapshot.data['customers'];
    this._tablePrices = this.activatedRoute.snapshot.data['tablePrices'];
    this._tableTimes = this.activatedRoute.snapshot.data['tableTimes'];
  }

  onSegmentChage(event: any) {
    this.segment = event.detail.value;
  }
  
  public async save() {
    const form = this.form.getRawValue();
    if (!form.items?.length) {
      form.sync = -1;
    } else {
      form.sync = 0;
    }
    if (this.activatedRoute.snapshot.params['id'] === 'new') {
      form.createdAt = new Date().toJSON();
      form.id = uuidv4();
      await this.dbService.add('sale_force_product', form).toPromise();
    }
    this.navController.back();
  }

  public onCustomerFilter() {
    if (this.customerFilter) {
      this.customers = this._customers.filter(c => c.name.toLowerCase().includes(this.customerFilter.toLowerCase()) || c.cpfCnpj === this.customerFilter);
    } else {
      this.customers = [];
    }
  }

  public onTablePriceFilter() {
    if (this.tablePriceFilter) {
      this.tablePrices = this._tablePrices.filter(c => c.name.toLowerCase().includes(this.tablePriceFilter.toLowerCase()));
    } else {
      this.tablePrices = [];
    }
  }

  public onTableTimeFilter() {
    if (this.tableTimesFilter) {
      this.tableTimes = this._tableTimes.filter(c => c.name.toLowerCase().includes(this.tableTimesFilter.toLowerCase()));
    } else {
      this.tableTimes = [];
    }
  }

  public onSelectCustomer(customer: Customer, modal: any) {
    modal.dismiss();
    this.form.get('customer')?.patchValue(customer);
  }

  public onSelectTablePrice(table: Customer, modal: any) {
    modal.dismiss();
    this.form.get('tablePrice')?.patchValue(table);
  }

  public onSelectTableTime(table: Customer, modal: any) {
    modal.dismiss();
    this.form.get('tablePaymentTerm')?.patchValue(table);
  }
}
