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

  constructor(
    private router: Router
  ) {
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
