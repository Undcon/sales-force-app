import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, LoadingController, NavController, Platform, ToastController } from '@ionic/angular';
import { settings } from 'cluster';
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
  @ViewChild('kitDetailModal') kitDetailModal: any;

  public isIos = false;

  public segment = 'product';

  public _items = [] as any[];
  public items = [] as any[];
  public itemsProducts = [] as any[];
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
  public tablePriceProduct = [] as any[];

  public itemForm: FormGroup;

  public isNew = true;

  public productPage = 1;

  public deleted = [] as number[];
  public error = '';

  public paymentTermSelectedList = [] as any[];

  public itensKitIndex = 0;

  public isSended = false;

  public itemType = 'kit';

  constructor(
    private platform: Platform,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dbService: NgxIndexedDBService,
    private navController: NavController,
    private toastController: ToastController,
    private route: Router,
    private loadingCtrl: LoadingController,
    private cdr: ChangeDetectorRef,
    private actionSheetCtrl: ActionSheetController
  ) { }

  ngOnInit() {
    this.isIos = this.platform.is('ios');
    var type = localStorage.getItem('itemType');
    if(type){
      this.itemType = type;
    }
    this.form = this.formBuilder.group({
      id: [],
      customer: [null, Validators.required],
      tablePrice: [],
      tablePaymentTerm: [],
      observation: [],
      paymentTermSelected: [],
      discountPercentInput: [0.00]
    });
    this.form.get('tablePaymentTerm')?.valueChanges.subscribe(async tablePaymentTerm => {
      try {
        if (tablePaymentTerm) {
          try {
            this.dbService.getAll('sale_force_table_price_product').subscribe(tablePriceProduct => {
              const price = this.form.get('tablePrice')?.getRawValue();
              this.tablePriceProduct = tablePriceProduct.filter((tp: any) => tp.table.id === price.id);
              this.dbService.getAll('sale_force_product_kit').subscribe(productsKit => {
                this.selectedItems.forEach(async selected => {
                  if (!selected?.name?.items?.length) {
                    const itens = productsKit.find((p: any) => p.id === selected?.name.id) as any;
                    selected.name.items = itens?.items || [];
                    selected.name.items.forEach((i: any) => {
                      const productTablePrice = this.tablePriceProduct.find(ptp => ptp.product?.id === i.product?.id);
                      if (productTablePrice) {
                        i.price = productTablePrice.price;
                      } else {
                        alert(`O produto ${i.product.name} não possui preço configurado na tabela de preço selecionada!`);
                        i.price = 0;
                      }
                    });
                  }
                })
              });
            });
          } catch (err) {

          }
          this.paymentTermSelectedList = await this.dbService.getAllByIndex('sale_force_table_time_product', 'tableId', IDBKeyRange.only(tablePaymentTerm.id)).toPromise() as any[];
          if (this.form.get('paymentTermSelected')?.value) {
            const item = this.paymentTermSelectedList.find(p => p.days === this.form.get('paymentTermSelected')?.value?.days);
            if (item) {
              this.form.get('paymentTermSelected')?.patchValue(item);
            }
          }

          if (!this.paymentTermSelectedList) {
            this.paymentTermSelectedList = [];
          }
        }
      } catch (err) {

      }
    });

    this.itemForm = this.formBuilder.group({
      id: [],
      name: [null],
      quantity: [null, Validators.compose([Validators.required, Validators.min(1)])]
    });
  }

  ionViewWillEnter() {
    this.deleted = [];
    this.isNew = this.activatedRoute.snapshot.params['id'] === 'new';
    this._customers = this.activatedRoute.snapshot.data['customers'];
    this.customers = [];
    this._tablePrices = this.activatedRoute.snapshot.data['tablePrices'];
    this.tablePrices = [];
    this._tableTimes = this.activatedRoute.snapshot.data['tableTimes'];
    this.tableTimes = [];
    for (let i = 0; i < 50; i++) {
      if (this._customers.length > i) {
        this.customers.push(this._customers[i]);
      }
      if (this._tablePrices.length > i) {
        this.tablePrices.push(this._tablePrices[i]);
      }
      if (this._tableTimes.length > i) {
        this.tableTimes.push(this._tableTimes[i]);
      }
    }
    if (this.activatedRoute.snapshot.data['entity']) {
      this.selectedItems = this.activatedRoute.snapshot.data['entity'].items;
      if (!this.selectedItems) {
        this.selectedItems = [];
      }
      this.dbService.getAll('sale_force_table_price_product').subscribe(tablePriceProduct => {
        this.tablePriceProduct = tablePriceProduct;
        this.dbService.getAll('sale_force_product_kit').subscribe(productsKit => {
          this.selectedItems.forEach(async selected => {
            if (!selected?.name?.items?.length) {
              const itens = productsKit.find((p: any) => p.id === selected?.name.id) as any;
              selected.name.items = itens?.items || [];
              selected.name.items.forEach((i: any) => {
                const productTablePrice = this.tablePriceProduct.find(ptp => ptp.product?.id === i.product?.id);
                if (productTablePrice) {
                  i.price = productTablePrice.price;
                } else {
                  alert(`O produto ${i.product.name} não possui preço configurado na tabela de preço selecionada!`);
                  i.price = 0;
                }
              });
            }
          })
        });
      });

      if (this.activatedRoute.snapshot.data['entity']?.id && !isNaN(this.activatedRoute.snapshot.data['entity']?.id) && this.activatedRoute.snapshot.data['entity']?.sync) {
        this.isSended = true;
        this.form.disable();
        this.itemForm.disable();
      } else {
        this.isSended = false;
        this.form.enable();
        this.itemForm.enable();
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

  async presentActionSheet(id: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opções do item',
      mode: 'ios',
      buttons: [
        {
          text: 'Editar item',
          handler: () => {
            this.edit(id);
          },
        },
        {
          text: 'Remover item',
          role: 'destructive',
          handler: () => {
            this.removeItem(id);
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        },
      ],
    });

    await actionSheet.present();
  }

  onSegmentChage(event: any) {
    this.segment = event.detail.value;
    this.cdr.detectChanges();
  }

  public async save(goBack = true, status = 0) {
    if (this.form.valid) {
      const form = this.form.getRawValue();
      form.items = this.selectedItems;
      if (this.deleted && this.deleted.length) {
        form.deleteds = this.deleted;
      }
      form.sync = status;
      form.error = null;
      if (this.activatedRoute.snapshot.params['id'] === 'new') {
        form.createdAt = new Date().toJSON();
        form.id = uuidv4();
        await this.dbService.add('sale_force_product', form).toPromise();
      } else {
        await this.dbService.update('sale_force_product', form).toPromise();
      }
      if (goBack) {
        this.navController.back();
      } else if (this.isNew) {
        const loading = await this.loadingCtrl.create({
          message: 'Criando o rascunho...',
          duration: 2000,
        });
        await loading.present();
        await this.navController.back();
        setTimeout(async () => {
          await this.route.navigate(['/', 'features', 'tab2', 'product-register', form.id]);
          setTimeout(() => {
            loading.dismiss().then();
          }, 600);
        }, 50);
      }

      const toast = await this.toastController.create({
        message: 'Salvo como rascunho',
        duration: 2000,
        color: 'primary',
        position: 'top',
        buttons: ['OK']
      });

      await toast.present();

    } else {
      const toast = await this.toastController.create({
        message: 'Selecione um cliente para salvar o pedido!',
        duration: 2500,
        color: 'warning',
        position: 'top'
      });

      await toast.present();
      this.form.markAllAsTouched();
    }
  }

  public onCustomerFilter() {
    if (this.customerFilter) {
      this.customers = this._customers.filter(c => c.name.toLowerCase().includes(this.customerFilter.toLowerCase()) || c.cpfCnpj.includes(this.customerFilter));
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
    const form = this.itemForm.getRawValue();
    if (this.itemForm.valid) {
      form.sync = 0;
      if (!form.id) {
        form.id = uuidv4();
      } else {
        this.removeItem(form.id);
        form.id = uuidv4();
      }
      let totalKit = 0;
      if(this.itemType === 'kit'){
          form?.name?.items.forEach((i: any) => {
            const productTablePrice = this.tablePriceProduct.find(ptp => ptp.product?.id === i.product?.id);
            if (productTablePrice && productTablePrice.price) {
              i.price = productTablePrice.price;
              totalKit += (productTablePrice.price * i.quantity);
            } else {
              alert(`O produto ${i.product.name} não possui preço configurado na tabela de preço selecionada!`);
              i.price = 0;
              return;
            }
          })
          form.type = 'PRODUCT_KIT';
          //O valor unitário do Kit é o valor total do produto da tabela de preço * a quantidade que tem do produto no KIT
          form.price = totalKit;
      } else {
        if(form?.name){
          const productTablePrice = this.tablePriceProduct.find(ptp => ptp.product?.id === form?.name.id);
          if (productTablePrice && productTablePrice.price) {
            form.price = productTablePrice.price;
          } else {
            alert(`O produto ${form?.name.name} não possui preço configurado na tabela de preço selecionada!`);
            form.price = 0;
            return;
          }
		      form.type = 'PRODUCT';
        }
            
      }
      
      this.selectedItems.push(form);

      this.itemForm.reset();
    } else {
      this.form.markAllAsTouched();
      if(!form.quantity){
        alert(`A quantidade deve ser informada!`);
      }
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
    let _items = [];
    this._items = [];
    if(this.itemType === 'kit'){
      _items = await this.dbService.getAll('sale_force_product_kit').toPromise() as any[];
      _items.filter(itm => {
        let exists = true;
        if (!itm.items?.length) {
          exists = false;
        }
        itm.items.forEach((i: any) => {
          const productTablePrice = this.tablePriceProduct.find(ptp => ptp.product?.id === i.product?.id);
          if (!productTablePrice) {
            exists = false;
          }
        });
        if (exists) {
          this._items.push(itm);
        }
      })
    } else {
      const tablePrice = this.form.get('tablePrice')?.value;

      const tablePriceItens = await this.dbService.getAllByIndex('sale_force_table_price_product', 'tableId', IDBKeyRange.only(tablePrice.id)).toPromise() as any[];
      tablePriceItens.forEach((tablePriceItem: any) => {
       this._items.push(tablePriceItem.product);
      });
    }
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
      this.items = JSON.parse(JSON.stringify(this._items.filter(c => c && c.name && c.name.toLowerCase().includes(this.productFilter.toLowerCase()))));
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
    items.forEach(i => total += parseFloat(i.price));
    return this.parseCurrency(total);
  }

  public totalKit(items: any) {
    return items?.price * items?.quantity;
  }

  public totalKits() {
    let total = 0;
    this.selectedItems.forEach(item => {
      total += this.totalKit(item);
    });
    return total;
  }

  public totalDiscount() {
    if (this.paymentTermSelectedList.length) {
      if (this.form.get('paymentTermSelected')?.value) {
        if (this.form.get('paymentTermSelected')?.value?.discount) {
          return this.form.get('paymentTermSelected')?.value?.discount;
        }
      }
    }
    return 0;
  }

  public totalDiscountByInput() {
    if (this.paymentTermSelectedList.length) {
      if (this.form.get('discountPercentInput')?.value) {
        return this.totalKits() * (this.form.get('discountPercentInput')?.value / 100);
      }
    }
    return 0;
  }

  public showItensKit(index: number) {
    this.itensKitIndex = index;
    if(this.itemType === 'kit'){
      this.kitDetailModal.present();
    }
  }

  public total() {
    return this.totalKits() - this.totalDiscountByInput();
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
