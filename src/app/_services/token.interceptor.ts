import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor() {}

  public getToken(): string {
    return 'c60fee6a-7b5b-4efd-9fef-afa6803c882f';
    //localStorage.getItem('accessToken');
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const modifiedRequest = request.clone({
      setHeaders: {
        Authorization: `APIKEY ${this.getToken()}`,
      },
    });

    return next.handle(modifiedRequest);
  }
}
