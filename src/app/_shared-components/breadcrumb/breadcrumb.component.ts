import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Location } from '@angular/common';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent implements OnDestroy {
  breadcrumb;
  subs = [];
  sub_mode: Subscription;
  showBack = false;
  showPortfolio = false;

  constructor(private router: Router, private location: Location) {
    router.events.subscribe(val => {
      if (val instanceof NavigationEnd && val['urlAfterRedirects']) {
        const url = val['urlAfterRedirects'];

        this.showBack = false;
        this.showPortfolio = false;
        if (url === '/manager/map') {
          this.breadcrumb = [{ title: 'Map Overview' }];
        } else if (url.startsWith('/manager/country')) {
          this.breadcrumb = [{ title: 'Country Overview' }];
        } else if (url.startsWith('/manager/region')) {
          this.breadcrumb = [{ title: 'Region Overview' }];
        } else if (url.startsWith('/manager/site')) {
          this.breadcrumb = [{ title: 'Site Overview' }];
        } else if (
          url === '/manager' ||
          url.startsWith('/manager#') ||
          url.startsWith('/manager/building')
        ) {
          this.breadcrumb = [{ title: 'Building Overview' }];
        } else if (url.startsWith('/manager/unit')) {
          this.breadcrumb = [{ title: 'Unit Overview' }];
        } else if (url.startsWith('/manager/layout')) {
          this.breadcrumb = [{ title: 'Layout Overview' }];
        } else if (url.startsWith('/manager/log')) {
          this.breadcrumb = [{ title: 'API Log Overview' }];
          this.showBack = true;
        } else if (url.startsWith('/georeference/multiple')) {
          this.breadcrumb = [{ title: 'Georeference Tool, batch tool' }];
        } else if (url.startsWith('/georeference')) {
          this.breadcrumb = [{ title: 'Georeference Tool' }];
          this.showPortfolio = true;
        } else if (url.startsWith('/login')) {
          this.breadcrumb = [{ title: 'Log In' }];
        } else if (url.startsWith('/editor')) {
          this.breadcrumb = [{ title: 'Layout editor' }];
          this.showBack = true;
        } else if (url.startsWith('/resetPassword')) {
          this.breadcrumb = [{ title: 'Reset password form' }];
        } else if (url.startsWith('/manager/potentialView')) {
          this.breadcrumb = [{ title: 'Potential view' }];
          this.showBack = true;
        } else if (url.startsWith('/manager/simulation/building')) {
          this.breadcrumb = [{ title: 'Raw Simulation view' }];
          this.showBack = true;
        } else if (url.startsWith('/manager/dpoiViewer')) {
          this.breadcrumb = [{ title: 'Dpoi Simulation map view' }];
          this.showBack = true;
        } else if (url.startsWith('/manager/dpoi')) {
          this.breadcrumb = [{ title: 'Dpoi Simulation table view' }];
          this.showBack = true;
        } else if (url.startsWith('/manager/viewSim')) {
          this.breadcrumb = [{ title: 'Real view simulation' }];
          this.showBack = true;
        } else {
          this.breadcrumb = [];
        }
      }
    });
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

  backPage() {
    this.location.back();
  }
  backPortfolio() {
    this.router.navigate(['manager', 'building']);
  }

  ngOnDestroy(): void {
    if (this.sub_mode) {
      this.sub_mode.unsubscribe();
    }
  }
}
