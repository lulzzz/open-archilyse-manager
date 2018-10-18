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

/**
 * User tries to Authenticate
 */
export class Authenticate implements Action {
  /** Authenticate type */
  readonly type = UserActionTypes.AUTHENTICATE;
  /** Action constructor */
  constructor(public payload: any) {}
}

/**
 * User Authenticate complete
 */
export class AuthenticateSuccess implements Action {
  /** AuthenticateSuccess type */
  readonly type = UserActionTypes.AUTHENTICATE_SUCCESS;
  /** Action constructor */
  constructor(public payload: any) {}
}

/**
 * User Authenticate error
 */
export class AuthenticateFailure implements Action {
  /** AuthenticateFailure type */
  readonly type = UserActionTypes.AUTHENTICATE_FAILURE;
  /** Action constructor */
  constructor(public payload: any) {}
}

/**
 * User tries to Sign In
 */
export class SignIn implements Action {
  /** SignIn type */
  readonly type = UserActionTypes.SIGN_IN;
  /** Action constructor */
  constructor(public payload: any) {}
}

/**
 * User Sign In complete
 */
export class SignInSuccess implements Action {
  /** SignInSuccess type */
  readonly type = UserActionTypes.SIGN_IN_SUCCESS;
  /** Action constructor */
  constructor(public payload: any) {}
}

/**
 * User Sign In error
 */
export class SignInFailure implements Action {
  /** SignInFailure type */
  readonly type = UserActionTypes.SIGN_IN_FAILURE;
  /** Action constructor */
  constructor(public payload: any) {}
}

/**
 * User Log Out
 */
export class LogOut implements Action {
  /** LogOut type */
  readonly type = UserActionTypes.LOG_OUT;
  /** Action constructor */
  constructor(public payload: any) {}
}

/**
 * User Log Out Success
 */
export class LogOutSuccess implements Action {
  /** LogOutSuccess type */
  readonly type = UserActionTypes.LOG_OUT_SUCCESS;
  /** Action constructor */
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
