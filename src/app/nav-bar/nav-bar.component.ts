import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import * as fromStore from '../_store';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { NavigationEnd, Router } from '@angular/router';
import { RouterEvent } from '@angular/router/src/events';

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit, OnDestroy {
  isUserLoggedIn = false;

  user_sub: Subscription;
  route_sub: Subscription;

  showOptions = true;
  isDropdownActive = false;

  constructor(private store: Store<fromStore.AppState>, private router: Router) {}

  @HostListener('document:click', ['$event'])
  clickedOutside() {
    if (this.isDropdownActive) {
      this.isDropdownActive = false;
    }
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
    if (this.route_sub) {
      this.route_sub.unsubscribe();
    }
  }

  toggleDropdown(event) {
    event.preventDefault();
    event.stopPropagation();
    this.isDropdownActive = !this.isDropdownActive;
  }

  logOut() {
    this.store.dispatch(new fromStore.LogOut({}));
  }
}
