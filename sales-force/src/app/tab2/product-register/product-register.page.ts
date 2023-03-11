import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-product-register',
  templateUrl: './product-register.page.html',
  styleUrls: ['./product-register.page.scss'],
})
export class ProductRegisterPage implements OnInit {

  public isIos = false;

  public segment = 'items';

  constructor(
    private platform: Platform
  ) { }

  ngOnInit() {
    this.isIos = this.platform.is('ios');
  }

  onSegmentChage(event: any) {
    this.segment = event.detail.value;
  }
}
