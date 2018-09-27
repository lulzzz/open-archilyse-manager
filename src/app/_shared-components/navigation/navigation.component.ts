import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NavigationService, UserService } from '../../_services';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit, OnDestroy {
  optionsAvailable = [];
  options = [];
  current = '';

  user_sub: Subscription;
  isUserLoggedIn: false;

  subscriptionNavCurrent: Subscription;
  subscriptionNavOptions: Subscription;
  subscriptionNavdiagramLinkActive: Subscription;

  currentProfile;
  currentUrl;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private navigationService: NavigationService
  ) {
    this.currentProfile = navigationService.profile.getValue();

    this.user_sub = this.userService._authenticated.subscribe(_authenticated => {
      this.isUserLoggedIn = _authenticated;
    });

    navigationService.profile$.subscribe(newProfile => {
      this.currentProfile = newProfile;
      this.prepareOptions();
      this.reactToUrlChange();
    });

    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd && val['urlAfterRedirects']) {
        this.currentUrl = val['urlAfterRedirects'];
        this.reactToUrlChange();
      }
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

    // analyst
    // data
    // manager
    // developer

    this.prepareOptions();
    this.options = this.optionsAvailable;
  }

  reactToUrlChange() {
    const url = this.currentUrl;

    if (url === '/manager/map') {
      this.current = 'map';
    } else if (url === '/manager/country') {
      this.current = 'country';
    } else if (url === '/manager/region') {
      this.current = 'region';
    } else if (url === '/manager/site') {
      this.current = 'site';
    } else if (url === '/manager') {
      this.current = 'building';
    } else if (url === '/manager/building') {
      this.current = 'building';
    } else if (url === '/manager/unit') {
      this.current = 'unit';
    } else if (url === '/manager/layout') {
      this.current = 'layout';
    } else if (url === '/manager/log') {
      this.current = 'log';
    } else {
      this.current = '';
    }

    if (url === '/error' || url === '/login' || url === '/logout') {
      this.options = [];
    } else {
      this.options = this.optionsAvailable;
    }
  }

  prepareOptions() {
    let extraOptions = [];
    if (this.currentProfile === 'analyst' || this.currentProfile === 'manager') {
      extraOptions = [
        {
          tooltip: 'Country overview',
          title: 'Country',
          link: '/manager/country',
          value: 'country',
        },
        {
          tooltip: 'Region overview',
          title: 'Region',
          link: '/manager/region',
          value: 'region',
        },
      ];
    }

    this.optionsAvailable = [
      {
        tooltip: 'Map overview',
        title: 'Map',
        link: '/manager/map',
        value: 'map',
      },
      ...extraOptions,
      {
        tooltip: 'Site overview',
        title: 'Site',
        link: '/manager/site',
        value: 'site',
      },
      {
        tooltip: 'Building overview',
        title: 'Building',
        link: '/manager/building',
        value: 'building',
      },
      {
        tooltip: 'Unit overview',
        title: 'Unit',
        link: '/manager/unit',
        value: 'unit',
      },
      {
        tooltip: 'Layout overview',
        title: 'Layout',
        link: '/manager/layout',
        value: 'layout',
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
    if (this.subscriptionNavdiagramLinkActive) {
      this.subscriptionNavdiagramLinkActive.unsubscribe();
    }
    if (this.user_sub) {
      this.user_sub.unsubscribe();
    }
  }
}
