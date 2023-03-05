import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlsErrosComponent } from './controls-erros/controls-erros.component';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';


@NgModule({
  declarations: [
    ControlsErrosComponent
  ],
  imports: [
    CommonModule,
    InputTextModule,
    InputMaskModule
  ],
  exports: [
    ControlsErrosComponent,
    InputTextModule,
    InputMaskModule
  ]
})
export class SharedModule { }
