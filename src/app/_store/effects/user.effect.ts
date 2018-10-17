import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { switchMap, map, catchError } from 'rxjs/operators';
import { Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import * as userActions from '../actions/user.action';
import { UserService } from '../../_services';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

/**
 * Effects regarding Log in (authentication), Log out action from a user
 */
@Injectable()
export class UserEffects {
  @Effect() name$: Observable<Action> = this.actions$.ofType('ACTIONTYPE');

  constructor(
    private actions$: Actions,
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  // @ts-ignore
  @Effect()
  authenticate$ = this.actions$
    .ofType(userActions.UserActionTypes.AUTHENTICATE)
    .pipe(
      map((action: userActions.Authenticate) => action.payload),
      switchMap(user => {
        return this.userService.authenticate(user.email, user.password).pipe(
          map(credentials => {
            this.toastr.success('Authenticated successfully');
            return new userActions.AuthenticateSuccess(credentials.user);
          }),
          catchError(error => {
            console.error('Failed to authenticate', error);
            this.toastr.error('Failed to authenticate');
            return of(new userActions.AuthenticateFailure(error.message));
          })
        );
      })
    );

  @Effect()
  authenticateSuccess$ = this.actions$
    .ofType(userActions.UserActionTypes.AUTHENTICATE_SUCCESS)
    .pipe(
      map((action: userActions.AuthenticateSuccess) => action.payload),
      switchMap(payload => {
        console.log(payload);
        return this.userService.user.pipe(
          map(user => new userActions.SignInSuccess(user))
        );
      })
    );

  @Effect()
  signIn$ = this.actions$.ofType(userActions.UserActionTypes.SIGN_IN).pipe(
    map((action: userActions.SignIn) => action.payload),
    switchMap(user_id => {
      return this.userService.user.pipe(
        map(user => {
          this.toastr.success('Signed in successfully');
          return new userActions.SignInSuccess(user);
        }),
        catchError(error => {
          console.error('Failed to sign in', error);
          this.toastr.error('Failed to sign in');
          return of(new userActions.SignInFailure(error));
        })
      );
    })
  );

  @Effect()
  signInFailure$ = this.actions$
    .ofType(userActions.UserActionTypes.SIGN_IN_FAILURE)
    .pipe(
      map((action: userActions.SignInFailure) => {
        return action.payload;
      }),
      switchMap(() => {
        this.userService.signOut();
        return of(new userActions.LogOutSuccess());
      })
    );

  @Effect()
  logOut$ = this.actions$.ofType(userActions.UserActionTypes.LOG_OUT).pipe(
    map((action: userActions.LogOut) => action.payload),
    switchMap(() => {
      this.userService.signOut();
      return of(new userActions.LogOutSuccess());
    })
  );
}
