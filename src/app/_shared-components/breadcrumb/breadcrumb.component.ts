import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd, GuardsCheckEnd } from '@angular/router';
import { RouterEvent } from '@angular/router/src/events';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent implements OnDestroy {
  breadcrumb;
  subs = [];
  sub_mode: Subscription;

  constructor(private router: Router) {
    router.events.subscribe(val => {
      if (val instanceof NavigationEnd && val['urlAfterRedirects']) {
        const url = val['urlAfterRedirects'];
        console.log('url ', url);
        if (url === '/manager/map') {
          this.breadcrumb = [{ title: 'Map Overview' }];
        } else if (url === '/manager/country') {
          this.breadcrumb = [{ title: 'Country Overview' }];
        } else if (url === '/manager/region') {
          this.breadcrumb = [{ title: 'Region Overview' }];
        } else if (url === '/manager/site') {
          this.breadcrumb = [{ title: 'Site Overview' }];
        } else if (url === '/manager') {
          this.breadcrumb = [{ title: 'Building Overview' }];
        } else if (url === '/manager/building') {
          this.breadcrumb = [{ title: 'Building Overview' }];
        } else if (url === '/manager/unit') {
          this.breadcrumb = [{ title: 'Unit Overview' }];
        } else if (url === '/manager/layout') {
          this.breadcrumb = [{ title: 'Layout Overview' }];
        } else if (url === '/manager/log') {
          this.breadcrumb = [{ title: 'API Log Overview' }];
        } else if (url.startsWith('/manager/potentialView')) {
          this.breadcrumb = [{ title: 'Potential View' }];
        } else if (url.startsWith('/manager/simulation/building')) {
          this.breadcrumb = [{ title: 'Raw simulation View' }];
        } else if (url.startsWith('/manager/dpoi')) {
          this.breadcrumb = [{ title: 'Dpoi simulation View' }];
        } else if (url.startsWith('/manager/viewSim')) {
          this.breadcrumb = [{ title: 'Real view simulation' }];
        } else {
          this.breadcrumb = [];
        }
      }
    });

    /**
    router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe((event: RouterEvent) => {
        // console.log('event ', event);
        if (event.url) {
          // console.log('event.url ', event.url);

          const urlAndFragment = event.url.split('#');

          let currentUrl;
          if (urlAndFragment) {
            currentUrl = urlAndFragment[0];
          } else {
            currentUrl = '';
          }

          const url = currentUrl.split('/');
          url.shift();
          this.processURL(url);
        }
      });
     */
  }

  processURL(url) {
    // We've to unsubscribe from everything before continuing.
    this.subs.forEach(sub => {
      if (sub) {
        sub.unsubscribe();
      }
    });

    this.breadcrumb = [];
  }

  ngOnDestroy(): void {
    if (this.sub_mode) {
      this.sub_mode.unsubscribe();
    }
  }
}
