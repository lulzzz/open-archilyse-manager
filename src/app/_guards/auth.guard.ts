import { Injectable, ErrorHandler } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserService } from '../_services';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import * as fromStore from '../_store';
import { catchError, take, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private store: Store<fromStore.AppState>,
    private router: Router,
    private userService: UserService
  ) {}

  isAuthorised(): Observable<any> {
    return this.store
      .select(fromStore.getUserLoaded)
      .pipe(map(userLoaded => this.attemptSignIn(userLoaded)));
  }

  attemptSignIn(userLoaded) {
    if (!userLoaded) {
      const data = this.userService.getLocalStorage();
      if (data.user_id && data.access_token) {
        this.store.dispatch(new fromStore.SignIn(data.user_id));
        return null;
      }
      window.location.href = '/login';
    }
    return userLoaded;
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return of(true);
  }
}
