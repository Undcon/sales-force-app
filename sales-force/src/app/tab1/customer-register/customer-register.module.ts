import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomerRegisterPageRoutingModule } from './customer-register-routing.module';

import { CustomerRegisterPage } from './customer-register.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomerRegisterPageRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [CustomerRegisterPage]
})
export class CustomerRegisterPageModule {}
