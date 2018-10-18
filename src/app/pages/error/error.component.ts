import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as fromStore from '../../_store/index';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';

/**
 * General error display component
 */
@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit, OnDestroy {
  /** User status to link him properly */
  isUserLoggedIn = false;

  /** User subscription */
  user_sub: Subscription;

  /**
   * Constructor
   * @param store Full aplication state
   * @param _router Angular Router to link the user to other pages
   */
  constructor(
    private store: Store<fromStore.AppState>,
    private _router: Router
  ) {}

  /** Once the component is loaded we check is the user is logged in */
  ngOnInit() {
    this.user_sub = this.store.select(fromStore.getUser).subscribe(user => {
      this.isUserLoggedIn = !!user;
    });
  }

  /**
   * Links to other pages
   */

  /** Link to the manager */
  toPortfolio() {
    this._router.navigate(['/manager']);
  }
  /** Link to login */
  toLogin() {
    this._router.navigate(['/login']);
  }

  /**
   * En of the cycle, we unsubscribe
   */
  ngOnDestroy(): void {
    if (this.user_sub) {
      this.user_sub.unsubscribe();
    }
  }
}
