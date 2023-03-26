import { Injectable, NgModule } from '@angular/core';
import { CanActivate, PreloadAllModules, Router, RouterModule, Routes } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { SessionService } from './core/entity/session/session.service';

@Injectable({
  providedIn: 'root'
})
class CanActivateLogin implements CanActivate {
  constructor(
    private dbService: NgxIndexedDBService,
    private router: Router,
    private sessionService: SessionService
  ) { }

  async canActivate() {
    try {
      const session = await this.dbService.getAll('sale_force_session').toPromise();
      if (session?.length) {
        if (navigator.onLine) {
          try {
            const response = await this.sessionService.login(session[0] as any).toPromise() as any;
            localStorage.setItem('token', response.token);
            this.router.navigate(['/', 'features', 'tab2']);
            return false;
          } catch (err) {
            return true;
          }
        } else {
          this.router.navigate(['/', 'features', 'tab2']);
          return false;
        }
      }
      return true;
    } catch (err) {
      return true;
    }
  }
}

const routes: Routes = [
  {
    path: 'features',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'sync',
    loadChildren: () => import('./sync/sync.module').then(m => m.SyncPageModule)
  },
  {
    path: '',
    canActivate: [CanActivateLogin],
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
