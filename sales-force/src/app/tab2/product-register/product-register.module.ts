import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductRegisterPageRoutingModule } from './product-register-routing.module';

import { ProductRegisterPage } from './product-register.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductRegisterPageRoutingModule,
    SharedModule,
    NgxMaskDirective,
    NgxMaskPipe,
    ReactiveFormsModule
  ],
  declarations: [ProductRegisterPage],
  providers: [provideNgxMask()]
})
export class ProductRegisterPageModule {}
