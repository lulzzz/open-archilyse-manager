import { Injectable, ErrorHandler } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserService } from '../_services';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import * as fromStore from '../_store';
import { take, map, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private store: Store<fromStore.AppState>,
    private router: Router,
    private userService: UserService
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.userService._authenticated.pipe(
      take(1),
      map(user => !!user),
      tap(loggedIn => {
        if (!loggedIn) {
          console.log('access denied');
          this.router.navigate(['login']);
        }
      }),
      // We need an Api Key to continue
      switchMap(authenticated => this.userService.user),
      map(user => user && user['api'] && !!user['api'].key)
    );
  }
}
