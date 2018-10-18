import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import * as fromStore from '../../_store/index';

/**
 * Notifies the user to upgrade the browser to use the app
 */
@Component({
  selector: 'app-upgrade-browser',
  templateUrl: './upgrade-browser.component.html',
  styleUrls: ['./upgrade-browser.component.scss'],
})
export class UpgradeBrowserComponent implements OnInit, OnDestroy {
  /** User status to link him properly */
  isUserLoggedIn = false;

  /** User Subscription */
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

  /** Link to the manager */
  toManager() {
    this._router.navigate(['/manager']);
  }

  /** Link to the login */
  toLogin() {
    this._router.navigate(['/login']);
  }

  /**
   * On init we subscribe to the user status (logged-in true / false)
   */
  ngOnInit() {
    this.user_sub = this.store.select(fromStore.getUser).subscribe(user => {
      this.isUserLoggedIn = !!user;
    });
  }

  /** Unsubscribe before destroying */
  ngOnDestroy(): void {
    if (this.user_sub) {
      this.user_sub.unsubscribe();
    }
  }
}
