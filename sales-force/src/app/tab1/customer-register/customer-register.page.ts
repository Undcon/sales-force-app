import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-customer-register',
  templateUrl: './customer-register.page.html',
  styleUrls: ['./customer-register.page.scss'],
})
export class CustomerRegisterPage implements OnInit {

  public form: FormGroup;

  public isCNPJ = false;

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
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
      console.log(cpfCnpj);
      
      if (cpfCnpj && cpfCnpj.replace('.', '').replace('.', '').replace('-', '').length > 11) {
        this.isCNPJ = true;
      } else {
        this.isCNPJ = false;
      }
    })
  }

}
