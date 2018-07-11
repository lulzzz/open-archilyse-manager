import {
  createSelector,
  createFeatureSelector,
  ActionReducerMap,
  combineReducers,
} from '@ngrx/store';
import * as fromUser from './user.reducer';

export interface AppState {
  user: fromUser.State;
}

export const reducers: ActionReducerMap<AppState> = {
  user: fromUser.reducer,
};

/**
 * ==== SELECTORS ====
 * Selectors are used to retrieve specific parts of our _store. Makes things nice an easy
 *
 * The 'createFeatureSelector' is a convenience method for returning a top level feature state.
 * It returns a typed selector function for a feature slice of state.
 *
 * The 'createSelector' method returns a callback function for selecting a slice of state
 */

/**
 * USER STATE
 */

// Select the unit portion of our _store
export const getUserState = createFeatureSelector<fromUser.State>('user');

// Select the entities from the unit portion of the store
export const getUserMeta = createSelector(getUserState, fromUser.getUserMeta);

// Select the entities from the unit portion of the store
export const getUser = createSelector(getUserState, fromUser.getUser);

// Select the entities from the unit portion of the _store
export const getUserError = createSelector(getUserState, fromUser.getUserError);

// Get the loading state
export const getUserLoading = createSelector(getUserState, fromUser.getUserLoading);

// Get the loaded state
export const getUserLoaded = createSelector(getUserState, fromUser.getUserLoaded);

// Get the loading state
export const getUserUpdating = createSelector(getUserState, fromUser.getUserUpdating);

// Get the loaded state
export const getUserUpdated = createSelector(getUserState, fromUser.getUserUpdated);

// Get the authenticating state
export const getUserAuthenticating = createSelector(getUserState, fromUser.getUserAuthenticating);

// Get the authenticated state
export const getUserAuthenticated = createSelector(getUserState, fromUser.getUserAuthenticated);
