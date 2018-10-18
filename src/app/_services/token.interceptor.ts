import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { UserService } from './user.service';
import { LogService } from './log.service';
import { Router } from '@angular/router';

/**
 * When logged in adds the APIKEY to each request to the API
 */
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  /** Constructor */
  constructor(
    private router: Router,
    private userService: UserService,
    private logService: LogService
  ) {}

  /**
   * We add the APIKEY to each request to the API
   * @param request
   * @param next
   */
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.logService.addRequest(this.router.url, request);
    const modifiedRequest = request.clone({
      setHeaders: {
        Authorization: `APIKEY ${this.userService.apiKey}`,
      },
    });

    return next.handle(modifiedRequest);
  }
}
