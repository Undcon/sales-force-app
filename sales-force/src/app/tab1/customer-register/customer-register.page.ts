import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, Platform, ToastController } from '@ionic/angular';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { CityService } from 'src/app/core/entity/city/city.service';

import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-customer-register',
  templateUrl: './customer-register.page.html',
  styleUrls: ['./customer-register.page.scss'],
})
export class CustomerRegisterPage implements OnInit {

  public form: FormGroup;

  public pfPj = 'pf';

  public isCNPJ = false;
  public isIos = false;

  public error = '';

  public states = [] as any[];
  public _city = [] as any[]
  public city = [] as any[];

  public cityFilter = '';

  public isNew = true;

  constructor(
    private formBuilder: FormBuilder,
    private platform: Platform,
    private navController: NavController,
    private toastController: ToastController,
    private dbService: NgxIndexedDBService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private cityService: CityService
  ) { }

  ngOnInit() {
    this.isIos = this.platform.is('ios');
    this.form = this.formBuilder.group({
      id: [],
      name: [null, Validators.compose([Validators.required, Validators.maxLength(255)])],
      state: [],
      city: [],
      district: [],
      address: [],
      phone: [],
      phone2: [],
      phone3: [],
      cpfCnpj: [],
      registerDate: [],
      birthDate: [],
      addressNumber: [],
      complement: [],
      cep: [],
      rg: [],
      email: [],
      motherName: []
    });
    this.form.get('cpfCnpj')?.valueChanges.subscribe(cpfCnpj => {
      if (cpfCnpj && cpfCnpj.replace('_', '').replace('_', '').replace('.', '').replace('.', '').replace('-', '').length > 11) {
        this.isCNPJ = true;
      } else {
        this.isCNPJ = false;
      }
    });
    this.form.get('state')?.valueChanges.subscribe(state => {
      try {
        this.city = this._city.filter(c => c.state.id === state);
      } catch (err) { }
    });
    this.form.get('cep')?.valueChanges.subscribe(async cep => {
      try {
        if (cep && cep.replace('_', '').replace('-', '').length >= 8) {
          const data = await this.cityService.loadCep(cep).toPromise() as any;
          this.form.get('address')?.patchValue(data.logradouro);
          this.form.get('district')?.patchValue(data.bairro);
          const state = this.states.find(s => s.initials === data.uf).id;
          this.form.get('state')?.patchValue(state);
          this.form.get('city')?.patchValue(this._city.find(c => c.name.toLowerCase() == data.localidade.toLowerCase() && c.state.initials === data.uf));
        }
      } catch (err) {

      }
    });
    
  }

  ionViewWillEnter() {
    this.isNew = this.activatedRoute.snapshot.params['id'] === 'new';
    this.dbService.getAll('sale_force_state').subscribe(states => {
      this.states = states as any[];
      this.cdr.detectChanges();
    });
    this.dbService.getAll('sale_force_city').subscribe(city => {
      this._city = city as any[];
    });
    if ((this.activatedRoute.snapshot.data as any).customer) {
      const customer = (this.activatedRoute.snapshot.data as any).customer;
      customer.state = customer?.state?.id;
      this.error = customer.error;
      if (customer?.cpfCnpj?.length > 11) {
        this.pfPj = 'pj';
      }
      this.form.patchValue(customer);
    }
  }

  public onSegmentChange(event: any) {
    this.pfPj = event.detail.value;
  }

  public onCityFilter() {
    this.city = this._city.filter(c => c.state.id === this.form.get('state')?.value);
    this.city = this.city.filter(c => c.name.toLowerCase().includes(this.cityFilter.toLowerCase()));
  }

  public async onSelect(item: any, filter: any) {
    filter.dismiss();
    this.form.get('city')?.patchValue(item);
  }

  public async save() {
    if (this.form.valid) {
      const form = this.form.getRawValue();
      if (form.cpfCnpj) {
        form.cpfCnpj = form.cpfCnpj.replace('.', '').replace('.', '').replace('.', '').replace('-', '').replace('/', '');
      }
      if (form.state) {
        form.state = { id: form.state };
      }
      if (form.phone) {
        form.phone = form.phone.replace('(', '').replace(')', '').replace('-', '').replace(/\s/g,'');
      }
      if (form.phone2) {
        form.phone2 = form.phone2.replace('(', '').replace(')', '').replace('-', '').replace(/\s/g,'');
      }
      if (form.phone3) {
        form.phone3 = form.phone3.replace('(', '').replace(')', '').replace('-', '').replace(/\s/g,'');
      }
      const session = await this.dbService.getAll('sale_force_session').toPromise() as any;
      if (session?.length) {
        form.representative = {
          id: session[0].representantive
        };
      }
      if (this.activatedRoute.snapshot.params['id'] === 'new') {
        form.id = uuidv4();
        form.sync = 0;
        this.dbService.add('sale_force_customer', form).subscribe();
      } else {
        form.id = this.activatedRoute.snapshot.params['id'];
        form.sync = 0;
        this.dbService.update('sale_force_customer', form).subscribe();
      }
      const toast = await this.toastController.create({
        message: 'Cliente salvo com sucesso!',
        duration: 3500,
        color: 'primary',
        position: 'top'
      });
      this.navController.back();
      toast.present().then();
    } else {
      this.form.markAllAsTouched();
    }
  }

}
