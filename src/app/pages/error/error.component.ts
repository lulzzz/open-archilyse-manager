import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as fromStore from '../../_store/index';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit, OnDestroy {
  isUserLoggedIn = false;
  user_sub: Subscription;

  constructor(private store: Store<fromStore.AppState>, private _router: Router) {}

  ngOnInit() {
    this.user_sub = this.store.select(fromStore.getUser).subscribe(user => {
      this.isUserLoggedIn = !!user;
    });
  }

  /**
   * Links to other pages
   */

  toProjects() {
    this._router.navigate(['/projects']);
  }

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