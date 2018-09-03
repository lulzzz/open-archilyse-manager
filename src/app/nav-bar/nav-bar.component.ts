import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import * as fromStore from '../_store';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { RouterEvent } from '@angular/router/src/events';
import { UserService } from '../_services';
import { environment } from '../../environments/environment';

const urlPortfolio = environment.urlPortfolio;

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

  urlLog = `${urlPortfolio}/log`;

  constructor(
    private userService: UserService,
    private store: Store<fromStore.AppState>,
    private router: Router
  ) {
    this.route_sub = router.events.subscribe((event: RouterEvent) => {
      this.showOptions = event.url && (event.url.startsWith('/manager') || event.url === '/');
    });

    this.userService._authenticated.subscribe(auth => {
      this.isUserLoggedIn = auth;
    });
  }

  @HostListener('document:click', ['$event'])
  clickedOutside() {
    if (this.isDropdownActive) {
      this.isDropdownActive = false;
    }
  }

  ngOnInit() {
    /**
     this.user_sub = this.userService._authenticated.subscribe(_authenticated => {
      this.isUserLoggedIn = _authenticated;
    });
     */
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
