import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-controls-erros',
  templateUrl: './controls-erros.component.html',
  styleUrls: ['./controls-erros.component.scss'],
})
export class ControlsErrosComponent {

  @Input() control: any;
  @Input() errorMessages: any = {};
  @Input() form: FormGroup;

  getErrorMessagesList() {
    if (!this.control || !this.control.touched) return [];
    return Object.keys(this.control.errors || {}).map(error => this.errorMessages[error]);
  }

}
