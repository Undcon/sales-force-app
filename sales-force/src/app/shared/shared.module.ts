import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlsErrosComponent } from './controls-erros/controls-erros.component';

@NgModule({
  declarations: [
    ControlsErrosComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ControlsErrosComponent
  ]
})
export class SharedModule { }
