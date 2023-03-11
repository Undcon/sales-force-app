import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductRegisterPageRoutingModule } from './product-register-routing.module';

import { ProductRegisterPage } from './product-register.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductRegisterPageRoutingModule,
    SharedModule
  ],
  declarations: [ProductRegisterPage]
})
export class ProductRegisterPageModule {}
