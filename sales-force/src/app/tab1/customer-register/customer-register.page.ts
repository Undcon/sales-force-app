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

  public pfPj = 'pj';

  public isCNPJ = false;
  public isIos = false;

  public error = '';

  public states = [] as any[];
  public _city = [] as any[]
  public city = [] as any[];

  public cityFilter = '';

  public isNew = true;

  public isValidDoc = true;

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
      state: [null, Validators.required],
      city: [null, Validators.required],
      district: [null, Validators.required],
      address: [null, Validators.required],
      phone: [null, Validators.required],
      phone2: [null],
      phone3: [null],
      cpfCnpj: [null, Validators.required],
      registerDate: [null],
      birthDate: [null],
      addressNumber: [null, Validators.required],
      complement: [null],
      cep: [null, Validators.required],
      rg: [null, Validators.required],
      email: [null, Validators.required],
      motherName: [null]
    });
    this.form.get('cpfCnpj')?.valueChanges.subscribe(cpfCnpj => {
      if (cpfCnpj && cpfCnpj.replace('_', '').replace('_', '').replace('.', '').replace('.', '').replace('-', '').length > 11) {
        this.isCNPJ = true;
        try {
          this.isValidDoc = this.cnpj(cpfCnpj.replace('_', '').replace('_', '').replace('.', '').replace('.', '').replace('-', ''));
        } catch (err) {
          console.log(err); 
        }
      } else {
        this.isCNPJ = false;
        try {
          this.isValidDoc = this.cpf(cpfCnpj.replace('_', '').replace('_', '').replace('.', '').replace('.', '').replace('-', ''));
        } catch (err) {
          console.log(err); 
        }
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

  private cpf(cpf: any) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.toString().length != 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    var result = true;
    [9, 10].forEach(function (j) {
      var soma = 0, r;
      cpf.split(/(?=)/).splice(0, j).forEach((e: any, i: any) => {
        soma += parseInt(e) * ((j + 2) - (i + 1));
      });
      r = soma % 11;
      r = (r < 2) ? 0 : 11 - r;
      if (r != cpf.substring(j, j + 1)) result = false;
    });
    return result;
  }

  private cnpj(cnpj: any) {

    cnpj = cnpj.replace(/\./g, '');
    cnpj = cnpj.replace('-', '');
    cnpj = cnpj.replace('/', '');
    cnpj = cnpj.split('');

    var v1 = 0;
    var v2 = 0;
    var aux = false;

    for (var i = 1; cnpj.length > i; i++) {
      if (cnpj[i - 1] != cnpj[i]) {
        aux = true;
      }
    }

    if (aux == false) {
      return false;
    }

    for (var i = 0, p1 = 5, p2 = 13; (cnpj.length - 2) > i; i++, p1--, p2--) {
      if (p1 >= 2) {
        v1 += cnpj[i] * p1;
      } else {
        v1 += cnpj[i] * p2;
      }
    }

    v1 = (v1 % 11);

    if (v1 < 2) {
      v1 = 0;
    } else {
      v1 = (11 - v1);
    }

    if (v1 != cnpj[12]) {
      return false;
    }

    for (var i = 0, p1 = 6, p2 = 14; (cnpj.length - 1) > i; i++, p1--, p2--) {
      if (p1 >= 2) {
        v2 += cnpj[i] * p1;
      } else {
        v2 += cnpj[i] * p2;
      }
    }

    v2 = (v2 % 11);

    if (v2 < 2) {
      v2 = 0;
    } else {
      v2 = (11 - v2);
    }

    if (v2 != cnpj[13]) {
      return false;
    } else {
      return true;
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
      if (form.cpfCnpj.length === 11 && !this.cpf(form.cpfCnpj)) {
        return alert('O CPF informado não é válido!');
      } else if (form.cpfCnpj.length > 11 && !this.cnpj(form.cpfCnpj)) {
        return alert('O CNPJ informado não é válido!');
      }
      if (form.state) {
        form.state = { id: form.state };
      }
      if (form.phone) {
        form.phone = form.phone.replace('(', '').replace(')', '').replace('-', '').replace(/\s/g, '');
      }
      if (form.phone2) {
        form.phone2 = form.phone2.replace('(', '').replace(')', '').replace('-', '').replace(/\s/g, '');
      }
      if (form.phone3) {
        form.phone3 = form.phone3.replace('(', '').replace(')', '').replace('-', '').replace(/\s/g, '');
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
