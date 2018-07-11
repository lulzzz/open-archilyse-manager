import * as fromUser from '../actions/user.action';
import { User } from '../../_models/user.interface';
// import { MOCK_USER } from '../../_mocks/mock-user';

export interface State {
  authenticated: boolean;
  authenticating: boolean;
  loaded: boolean;
  loading: boolean;
  user?: User;
  updating: boolean;
  updated: boolean;
  refreshing: boolean;
  refreshed: boolean;
  error?: string;
}

const initialState: State = {
  authenticated: false,
  authenticating: false,
  loaded: false,
  loading: false,
  updating: false,
  updated: false,
  refreshing: false,
  refreshed: false,
};

/*     META REDUCER     */
export function logout(reducer) {
  return function(state, action) {
    return reducer(action.type === fromUser.UserActionTypes.LOG_OUT ? {} : state, action);
  };
}
/*  END OF META REDUCER  */

export function reducer(state = initialState, action: fromUser.UserActions): State {
  switch (action.type) {
    case fromUser.UserActionTypes.AUTHENTICATE: {
      return {
        ...state,
        authenticating: true,
        error: null,
      };
    }

    case fromUser.UserActionTypes.AUTHENTICATE_SUCCESS: {
      // const user = action.payload;
      return {
        ...state,
        authenticated: true,
        authenticating: false,
        error: null,
      };
    }

    case fromUser.UserActionTypes.AUTHENTICATE_FAILURE: {
      return {
        ...state,
        authenticated: false,
        authenticating: false,
        error: action.payload,
      };
    }

    case fromUser.UserActionTypes.SIGN_IN: {
      return {
        ...state,
        loading: true,
      };
    }

    case fromUser.UserActionTypes.SIGN_IN_SUCCESS: {
      const user = action.payload;
      return {
        ...state,
        user,
        authenticated: true,
        authenticating: false,
        loading: false,
        loaded: true,
      };
    }

    case fromUser.UserActionTypes.SIGN_IN_FAILURE: {
      return {
        ...state,
        loading: false,
        loaded: false,
      };
    }
    // FETCH USER

    case fromUser.UserActionTypes.FETCH: {
      return {
        ...state,
        refreshing: true,
      };
    }

    case fromUser.UserActionTypes.FETCH_SUCCESS: {
      const user = action.payload;
      return {
        ...state,
        user,
        refreshing: false,
        refreshed: true,
      };
    }

    case fromUser.UserActionTypes.FETCH_FAILURE: {
      return {
        ...state,
        refreshing: false,
        refreshed: false,
      };
    }

    // UPDATE USER
    case fromUser.UserActionTypes.UPDATE_USER: {
      return {
        ...state,
        updating: true,
      };
    }

    case fromUser.UserActionTypes.UPDATE_USER_SUCCESS: {
      const user = action.payload;
      return {
        ...state,
        user,
        updating: false,
        updated: true,
      };
    }
    case fromUser.UserActionTypes.UPDATE_USER_FAILURE: {
      return {
        ...state,
        updating: false,
        updated: false,
      };
    }

    default: {
      return state;
    }
  }
}

export const getUser = (state: State) => state.user;
export const getUserError = (state: State) => state.error;
export const getUserMeta = (state: State) => {
  const { user, ...meta } = state;
  return meta;
};
export const getUserLoading = (state: State) => state.loading;
export const getUserLoaded = (state: State) => state.loaded;
export const getUserUpdating = (state: State) => state.updating;
export const getUserUpdated = (state: State) => state.updated;
export const getUserAuthenticating = (state: State) => state.authenticating;
export const getUserAuthenticated = (state: State) => state.authenticated;
export const getUserRefreshing = (state: State) => state.refreshing;
export const getUserRefreshed = (state: State) => state.refreshed;
