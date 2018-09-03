import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import * as fromStore from '../_store';

@Component({
  selector: 'app-upgrade-browser',
  templateUrl: './upgrade-browser.component.html',
  styleUrls: ['./upgrade-browser.component.scss'],
})
export class UpgradeBrowserComponent implements OnInit, OnDestroy {
  isUserLoggedIn = false;

  /**
   * Subscriptions
   */
  user_sub: Subscription;

  constructor(private store: Store<fromStore.AppState>, private _router: Router) {}

  toProjects() {
    this._router.navigate(['/projects']);
  }

  toLogin() {
    this._router.navigate(['/login']);
  }

  ngOnInit() {
    this.user_sub = this.store.select(fromStore.getUser).subscribe(user => {
      this.isUserLoggedIn = !!user;
    });
  }

  ngOnDestroy(): void {
    if (this.user_sub) {
      this.user_sub.unsubscribe();
    }
  }
}
