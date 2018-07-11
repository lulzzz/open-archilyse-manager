import { of } from 'rxjs/observable/of';
import { catchError, filter, switchMap, take, tap } from 'rxjs/operators';

import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import * as fromStore from '../_store';
import { Store } from '@ngrx/store';

import { User } from '../_models';

export class UtilsGuard {
  static stdErr(e) {
    console.error(e);
    return of(false);
  }

  /**
   *
   * @param {User} user
   * @param {ActivatedRouteSnapshot} next
   * @param {RouterStateSnapshot} state
   * @param {Function} onComplete
   * @returns {Observable<boolean>}
   */
  static getPaths(
    user: User,
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    onComplete: Function
  ): Observable<boolean> {
    console.log('state.url ', state.url);

    // We'll exclude the fragment
    const urlAndFragment = state.url.split('#');

    let currentUrl;
    if (urlAndFragment) {
      currentUrl = urlAndFragment[0];
    } else {
      currentUrl = '';
    }

    const urlSegments = currentUrl.split('/');

    const path1 = urlSegments[1] ? urlSegments[1] : null;
    const path2 = urlSegments[2] ? urlSegments[2] : null;
    const path3 = urlSegments[3] ? urlSegments[3] : null;
    const path4 = urlSegments[4] ? urlSegments[4] : null;
    const path5 = urlSegments[5] ? urlSegments[5] : null;

    return onComplete(user, path1, path2, path3, path4, path5);
  }

  /**
   *
   * @param {Store<AppState>} store
   * @param {ActivatedRouteSnapshot} next
   * @param {RouterStateSnapshot} state
   * @param {Function} onComplete
   * @returns {Observable<boolean>}
   */
  static getUserAndPaths(
    store: Store<fromStore.AppState>,
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    onComplete: Function
  ): Observable<boolean> {
    // We start once we've an user
    return store
      .select(fromStore.getUser)
      .pipe(
        filter((data: any) => data && data.api_key),
        take(1),
        switchMap((user: User) => UtilsGuard.getPaths(user, next, state, onComplete)),
        catchError(this.stdErr)
      );
  }

  /**
   * We check if the date is null or is more than 1h ago
   * @param date
   * @returns {boolean}
   */
  static checkTime(date) {
    const nowTime = new Date().getTime();
    const maxCacheTime = 60 * 60 * 1000; // 1h

    if (date) {
      return nowTime - date.getTime() < maxCacheTime;
    }
    return false;
  }
}
