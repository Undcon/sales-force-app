import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../core/entity/session/session.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  public form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private sessionService: SessionService,
    private router: Router
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: [null, Validators.compose([Validators.required, Validators.maxLength(255)])],
      password: [null, Validators.compose([Validators.required, Validators.maxLength(18)])]
    });
  }

  public async login() {
    if (this.form.valid) {
      await this.sessionService.insert(this.form.getRawValue());
      this.router.navigate(['/features']);
    } else {
      this.form.markAllAsTouched();
    }
  }

}
