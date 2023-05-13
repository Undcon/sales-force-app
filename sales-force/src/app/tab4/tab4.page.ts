import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {

  public user = null as any;

  constructor(
    private router: Router,
    private dbService: NgxIndexedDBService
  ) { }

  ngOnInit() {
    this.dbService.getAll('sale_force_session').subscribe(session => {
      this.user = session[0];
    });
  }

  async logoff() {
    localStorage.clear();
    this.dbService.clear('sale_force_session').subscribe(() => {
      this.router.navigate(['/']);
    });
  }

}
