import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { switchMap, map, catchError, take, tap } from 'rxjs/operators';
import { Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import * as userActions from '../actions/user.action';
import { UserService } from '../../_services';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class UserEffects {
  @Effect() name$: Observable<Action> = this.actions$.ofType('ACTIONTYPE');

  constructor(
    private actions$: Actions,
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  @Effect()
  authenticate$ = this.actions$.ofType(userActions.UserActionTypes.AUTHENTICATE).pipe(
    map((action: userActions.Authenticate) => action.payload),
    switchMap(user => {
      return this.userService.authenticate(user.email, user.password).pipe(
        map(user => {
          this.toastr.success('Authenticated successfully');
          return new userActions.AuthenticateSuccess(user);
        }),
        catchError(error => {
          console.error('Failed to authenticate', error);
          this.toastr.error('Failed to authenticate');
          return of(new userActions.AuthenticateFailure(error));
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
        return this.userService
          .setLocalStorage(payload)
          .pipe(map(userId => new userActions.SignIn(userId)));
      })
    );

  @Effect()
  signIn$ = this.actions$.ofType(userActions.UserActionTypes.SIGN_IN).pipe(
    map((action: userActions.SignIn) => action.payload),
    switchMap(user_id => {
      return this.userService.getUser(user_id).pipe(
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
  signInFailure$ = this.actions$.ofType(userActions.UserActionTypes.SIGN_IN_FAILURE).pipe(
    map((action: userActions.SignInFailure) => {
      return action.payload;
    }),
    switchMap(() => {
      this.userService.signOut();
      return of(new userActions.LogOutSuccess());
    })
  );

  @Effect()
  fetchUser$ = this.actions$.ofType(userActions.UserActionTypes.FETCH).pipe(
    map((action: userActions.Fetch) => action.payload),
    tap(_ => console.log('Refreshing user data...')),
    switchMap(user_id => {
      return this.userService.getUser(user_id).pipe(
        map(user => {
          // this.toastr.success('User data refreshed');
          console.log('User data refreshed');
          return new userActions.FetchSuccess(user);
        }),
        catchError(error => {
          // this.toastr.error('Failed to refresh user data');
          console.error('User data not refreshed', error);
          return of(new userActions.FetchFailure(error));
        })
      );
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

  @Effect()
  updateUser$ = this.actions$.ofType(userActions.UserActionTypes.UPDATE_USER).pipe(
    map((action: userActions.UpdateUser) => {
      return action.payload;
    }),
    switchMap(payload => {
      return this.userService
        .updateUser(payload)
        .pipe(
          map(unit => new userActions.UpdateUserSuccess(unit)),
          catchError(error => of(new userActions.UpdateUserFailure(error)))
        );
    })
  );

  // @Effect()
  // signInSuccess$ = this.actions$.ofType(userActions.UserActionTypes.SIGN_IN_SUCCESS).pipe(
  //   map((action: userActions.SignIn) => {
  //     return action.payload;
  //   }),
  //   switchMap(() => this.router.navigate(['/']))
  // );
}
