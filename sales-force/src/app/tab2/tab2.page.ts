import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  public isIos = false;

  constructor(
    private platform: Platform
  ) {}

  ngOnInit() {
    this.isIos = this.platform.is('ios');
  }

}
