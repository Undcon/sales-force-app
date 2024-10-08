import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlsErrosComponent } from './controls-erros/controls-erros.component';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
  declarations: [
    ControlsErrosComponent
  ],
  imports: [
    CommonModule,
    InputTextModule,
    InputMaskModule,
    AutoCompleteModule,
    DropdownModule
  ],
  exports: [
    ControlsErrosComponent,
    InputTextModule,
    InputMaskModule,
    AutoCompleteModule,
    DropdownModule,
    CalendarModule
  ]
})
export class SharedModule { }
