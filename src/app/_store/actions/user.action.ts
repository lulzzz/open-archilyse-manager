import { Action } from '@ngrx/store';

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
  LOG_OUT = '[User] Log Out',
  LOG_OUT_SUCCESS = '[User] Log Out Success ',
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

export class LogOut implements Action {
  readonly type = UserActionTypes.LOG_OUT;
  constructor(public payload: any) {}
}

export class LogOutSuccess implements Action {
  readonly type = UserActionTypes.LOG_OUT_SUCCESS;
  constructor() {}
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
  | LogOut;
