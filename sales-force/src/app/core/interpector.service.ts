import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';

import { Router } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Injectable()
export class InterceptorService implements HttpInterceptor {

  constructor(
    private dbService: NgxIndexedDBService,
    private router: Router
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    return new Observable(observer => {
      const token = localStorage.getItem('token');
      if (token) {
        req = req.clone({
          setHeaders: {
            'Authorization': token as any
          }
        });
      }
      const subscription = next.handle(req).subscribe(
        event => {
          if (event instanceof HttpResponse) {
            observer.next(event);
          }
        },
        err => {
          if (err.status === 403) {
            localStorage.clear();
            this.router.navigate(['/auth']);
          }
          observer.error(err);
        },
        () => {
          observer.complete();
        }
      );
      return () => {
        subscription.unsubscribe();
      };
    });
  }
}
