import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import * as fromStore from '../../_store/index';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { RouterEvent } from '@angular/router/src/events';
import { UserService, NavigationService } from '../../_services';
import { environment } from '../../../environments/environment';

/**
 * Top bar in the application
 */
@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit, OnDestroy {
  isUserLoggedIn = false;

  showOptions = true;
  isDropdownActive = false;

  urlConsole = environment.urlConsole;

  /** user profile */
  currentProfile;

  /**
   * Subscriptions
   */
  user_sub: Subscription;
  route_sub: Subscription;

  logoLink = '/';

  constructor(
    private navigationService: NavigationService,
    private userService: UserService,
    private store: Store<fromStore.AppState>,
    private router: Router
  ) {
    this.route_sub = router.events.subscribe((event: RouterEvent) => {
      this.showOptions =
        event.url &&
        (event.url.startsWith('/manager') ||
          event.url.startsWith('/georeference') ||
          event.url.startsWith('/editor') ||
          event.url === '/');
    });

    this.userService._authenticated.subscribe(auth => {
      this.isUserLoggedIn = auth;
      if (auth) {
        this.logoLink = '/';
      } else {
        this.logoLink = 'https://www.archilyse.com/';
      }
    });

    this.currentProfile = navigationService.profile.getValue();
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

  /** Unsubscribe before destroying */
  ngOnDestroy(): void {
    if (this.user_sub) {
      this.user_sub.unsubscribe();
    }
    if (this.route_sub) {
      this.route_sub.unsubscribe();
    }
  }

  changeProfile(event) {
    console.log('changeProfile', event.target.value);
    this.navigationService.setProfile(event.target.value);
    this.currentProfile = event.target.value;

    // Data analyst -- See & dowload ARCHILYSE data
    // Data input -- Imputs data
    // Asset Manager -- Review Data
    // Software developer  --  Implements
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
