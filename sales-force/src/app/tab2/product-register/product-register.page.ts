import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  @ViewChild('modalItem') modalItem: any;

  public isIos = false;

  public segment = 'product';

  public _items = [] as any[];
  public items = [] as any[];
  public productFilter = '';

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

  public selectedItems = [] as any[];

  public itemForm: FormGroup;

  public isNew = true;

  public productPage = 1;

  public deleted = [] as number[];
  public error = '';

  public paymentTermSelectedList = [] as any[];

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
      observation: [],
      paymentTermSelected: []
    });
    this.form.get('tablePaymentTerm')?.valueChanges.subscribe(async tablePaymentTerm => {
      try {
        if (tablePaymentTerm) {
          this.paymentTermSelectedList = await this.dbService.getAllByIndex('sale_force_table_time_product', 'tableId', IDBKeyRange.only(tablePaymentTerm.id)).toPromise() as any[];
          if (!this.paymentTermSelectedList) {
            this.paymentTermSelectedList = [];
          }
        }
      } catch (err) {

      }
    })
    this.itemForm = this.formBuilder.group({
      id: [],
      name: [null],
      quantity: [null, Validators.compose([Validators.required])]
    });
  }

  ionViewWillEnter() {
    this.deleted = [];
    this.isNew = this.activatedRoute.snapshot.params['id'] === 'new';
    this._customers = this.activatedRoute.snapshot.data['customers'];
    this._tablePrices = this.activatedRoute.snapshot.data['tablePrices'];
    this._tableTimes = this.activatedRoute.snapshot.data['tableTimes'];
    if (this.activatedRoute.snapshot.data['entity']) {
      this.selectedItems = this.activatedRoute.snapshot.data['entity'].items;
      if (!this.selectedItems) {
        this.selectedItems = [];
      }
      this.form.patchValue(this.activatedRoute.snapshot.data['entity']);
      this.error = this.activatedRoute.snapshot.data['entity']?.error;
      if (this.activatedRoute.snapshot.data['entity']?.deleteds) {
        this.deleted = this.activatedRoute.snapshot.data['entity']?.deleteds;
      } else {
        this.deleted = [];
      }
    }
  }

  onSegmentChage(event: any) {
    this.segment = event.detail.value;
  }

  public async save() {
    const form = this.form.getRawValue();
    form.items = this.selectedItems;
    if (this.deleted && this.deleted.length) {
      form.deleteds = this.deleted;
    }
    form.sync = 0;
    form.error = null;
    if (this.activatedRoute.snapshot.params['id'] === 'new') {
      form.createdAt = new Date().toJSON();
      form.id = uuidv4();
      await this.dbService.add('sale_force_product', form).toPromise();
    } else {
      await this.dbService.update('sale_force_product', form).toPromise();
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

  public onSelectItem(item: any, modal: any) {
    this.itemForm.get('name')?.patchValue(item);
    modal.dismiss();
  }

  public addItem() {
    if (this.itemForm.valid) {
      const form = this.itemForm.getRawValue();
      form.sync = 0;
      if (!form.id) {
        form.id = uuidv4();
      } else {
        this.removeItem(form.id);
      }
      this.selectedItems.push(form);
      this.itemForm.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }

  public removeItem(id: any) {
    if (!isNaN(id)) {
      this.deleted.push(id);
    }
    this.selectedItems = this.selectedItems.filter(s => s.id !== id);
  }

  public edit(id: string) {
    const item = this.selectedItems.find(s => s.id === id);
    this.itemForm.patchValue(item);
  }

  public async showItens() {
    this._items = await this.dbService.getAll('sale_force_product_kit').toPromise() as any[];
    this.items = [];
    for (let i = 0; i < 100; i++) {
      if (this._items[i]) {
        this.items.push(JSON.parse(JSON.stringify(this._items[i])));
        try {
          this.items[i].product = this._items[i].items.map((i: any) => i.product.name).join(', ');
        } catch (err) { }
      }
    }
    this.productPage = 1;
    this.modalItem.present();
  }

  public onProductFilter() {
    if (this.productFilter) {
      this.items = JSON.parse(JSON.stringify(this._items.filter(c => c.product && c.product.name && c.product.name.toLowerCase().includes(this.productFilter.toLowerCase()))));
    } else {
      this.items = [];
      for (let i = 0; i < 100; i++) {
        if (this._items[i]) {
          this.items.push(JSON.parse(JSON.stringify(this._items[i])));
        }
      }
    }
    this.productPage = 1;
    this.items.forEach(i => {
      if (i.price) {
        i.price = parseFloat(i.price).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
      }
    });
  }

  public totalProduct(items: any[]) {
    let total = 0;
    items.forEach(i => total += parseFloat(i.product?.salePrice));
    return this.parseCurrency(total);
  }

  public totalKit(items: any[], quantity: number) {
    let total = 0;
    items.forEach(i => total += parseFloat(i.product?.salePrice));
    return total * quantity;
  }

  public totalKits() {
    let total = 0;
    this.selectedItems.forEach(item => {
      total += this.totalKit(item.name.items, item?.quantity);
    });
    return total;
  }

  public totalDiscount() {
    if (this.form.get('paymentTermSelected')?.value) {
      const discount = this.paymentTermSelectedList.find(p => p.days === this.form.get('paymentTermSelected')?.value)?.discount;
      if (discount) {
        return this.totalKits() * (discount / 100);
      }
    }
    return 0;
  }

  public total() {
    return this.totalKits() - this.totalDiscount();
  }

  public parseCurrency(value: number) {
    return value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
  }

  public onProductsLoadMore(event: any) {
    this.productPage++;
    for (let i = ((100 * this.productPage) - 100); i < (100 * this.productPage); i++) {
      if (this._items[i]) {
        this.items.push(JSON.parse(JSON.stringify(this._items[i])));
      }
    }
    event.target.complete();
  }
}
