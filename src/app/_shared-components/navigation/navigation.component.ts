import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationService } from '../../_services/navigation.service';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {UserService} from '../../_services';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit, OnDestroy {
  options = [];
  current = '';

  user_sub: Subscription;
  isUserLoggedIn: false;

  subscriptionNavCurrent: Subscription;
  subscriptionNavOptions: Subscription;
  subscriptionNavdiagramLinkActive: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private navigationService: NavigationService
  ) {

    this.user_sub = this.userService._authenticated.subscribe(_authenticated => {
      this.isUserLoggedIn = _authenticated;
    });

    /**
    router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe((event: NavigationEnd) => {
        const urlAndFragment = event.url.split('#');

        let urlString = '';
        let urlHash = '';

        if (urlAndFragment.length > 0) {
          urlString = urlAndFragment[0];
        }

        if (urlAndFragment.length > 1) {
          urlHash = urlAndFragment[1];
          this.current = urlHash;
        }

        const url = urlString.split('/');
        url.shift();
        this.processURL(url);
      });
     */
    this.options = [
      {
        tooltip: 'Country overview',
        title: 'Country',
        link: '/manager/country',
      },
      {
        tooltip: 'Region overview',
        title: 'Region',
        link: '/manager/region',
      },
      {
        tooltip: 'Site overview',
        title: 'Site',
        link: '/manager/site',
      },
      {
        tooltip: 'Building overview',
        title: 'Building',
        link: '/manager/building',
      },
      {
        tooltip: 'Unit overview',
        title: 'Unit',
        link: '/manager/unit',
      },
      {
        tooltip: 'Layout overview',
        title: 'Layout',
        link: '/manager/layout',
      },
    ];
  }

  processURL(url) {
    this.options = [];
  }

  ngOnInit() {
    this.subscriptionNavCurrent = this.navigationService.current$.subscribe(current => {
      this.current = current;
    });
    this.subscriptionNavdiagramLinkActive = this.navigationService.diagramLinkActive$.subscribe(
      diagramLinkActive => this.processDiagramLinkActive(diagramLinkActive)
    );
    this.subscriptionNavOptions = this.navigationService.options$.subscribe(options => {
      this.options = options;
    });
  }

  changeVal(newValue) {
    console.log('changeVal', newValue);
    this.router.navigate([], { fragment: newValue, relativeTo: this.route });
    this.navigationService.setCurrent(newValue);
  }

  processDiagramLinkActive(value) {
    this.options = [];
  }

  ngOnDestroy(): void {
    if (this.subscriptionNavCurrent) {
      this.subscriptionNavCurrent.unsubscribe();
    }
    if (this.subscriptionNavOptions) {
      this.subscriptionNavOptions.unsubscribe();
    }
    if (this.user_sub) {
      this.user_sub.unsubscribe();
    }
  }
}
