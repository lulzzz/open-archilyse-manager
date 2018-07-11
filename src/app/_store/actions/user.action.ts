import { Action } from '@ngrx/store';
import { User } from '../../_models/user.interface';

/**
 * For each action type in an action group, make a simple
 * enum object for all of this group's action types.
 */
export enum UserActionTypes {
  AUTHENTICATE = '[User] Authenticate',
  AUTHENTICATE_SUCCESS = '[User] Authenticate Success',
  AUTHENTICATE_FAILURE = '[User] Authenticate Failure',
  SIGN_IN = '[User] Sign In',
  SIGN_IN_SUCCESS = '[User] Sign In Success',
  SIGN_IN_FAILURE = '[User] Sign In Failure',
  FETCH = '[User] Fetch',
  FETCH_SUCCESS = '[User] Fetch Success',
  FETCH_FAILURE = '[User] Fetch Failure',
  LOG_OUT = '[User] Log Out',
  LOG_OUT_SUCCESS = '[User] Log Out Success ',
  UPDATE_USER = '[User] Update ',
  UPDATE_USER_SUCCESS = '[User] Update Success ',
  UPDATE_USER_FAILURE = '[User] Update Failure ',
}

export class Authenticate implements Action {
  readonly type = UserActionTypes.AUTHENTICATE;
  constructor(public payload: any) {}
}

export class AuthenticateSuccess implements Action {
  readonly type = UserActionTypes.AUTHENTICATE_SUCCESS;
  // constructor(public payload: Partial<User>) {}
  constructor(public payload: any) {}
}

export class AuthenticateFailure implements Action {
  readonly type = UserActionTypes.AUTHENTICATE_FAILURE;
  constructor(public payload: any) {}
}

export class SignIn implements Action {
  readonly type = UserActionTypes.SIGN_IN;
  constructor(public payload: any) {}
}

export class SignInSuccess implements Action {
  readonly type = UserActionTypes.SIGN_IN_SUCCESS;
  constructor(public payload: any) {}
}

export class SignInFailure implements Action {
  readonly type = UserActionTypes.SIGN_IN_FAILURE;
  constructor(public payload: any) {}
}

export class Fetch implements Action {
  readonly type = UserActionTypes.FETCH;
  constructor(public payload: any) {}
}

export class FetchSuccess implements Action {
  readonly type = UserActionTypes.FETCH_SUCCESS;
  constructor(public payload: any) {}
}

export class FetchFailure implements Action {
  readonly type = UserActionTypes.FETCH_FAILURE;
  constructor(public payload: any) {}
}

export class LogOut implements Action {
  readonly type = UserActionTypes.LOG_OUT;
  constructor(public payload: any) {}
}

export class LogOutSuccess implements Action {
  readonly type = UserActionTypes.LOG_OUT_SUCCESS;
  constructor() {}
}

export class UpdateUser implements Action {
  readonly type = UserActionTypes.UPDATE_USER;
  constructor(public payload: User) {}
}
export class UpdateUserSuccess implements Action {
  readonly type = UserActionTypes.UPDATE_USER_SUCCESS;
  constructor(public payload: User) {}
}
export class UpdateUserFailure implements Action {
  readonly type = UserActionTypes.UPDATE_USER_FAILURE;
  constructor(public payload: any) {}
}
/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type UserActions =
  | Authenticate
  | AuthenticateSuccess
  | AuthenticateFailure
  | SignIn
  | SignInSuccess
  | SignInFailure
  | Fetch
  | FetchSuccess
  | FetchFailure
  | LogOut
  | UpdateUser
  | UpdateUserSuccess
  | UpdateUserFailure;
