import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { SessionService } from '../core/entity/session/session.service';

import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  public form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dbService: NgxIndexedDBService,
    private sessionService: SessionService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: [null, Validators.compose([Validators.required, Validators.maxLength(255)])],
      password: [null, Validators.compose([Validators.required, Validators.maxLength(18)])]
    });
  }

  public async login() {
    if (this.form.valid) {
      const response = await this.sessionService.login(this.form.getRawValue()).toPromise() as any;
      const form = this.form.getRawValue();
      form.token = response.token;
      localStorage.setItem('token', response.token);
      form.id = uuidv4();
      await this.dbService.add('sale_force_session', form).toPromise();
      this.router.navigate(['/sync']);
    } else {
      this.form.markAllAsTouched();
    }
  }

}
