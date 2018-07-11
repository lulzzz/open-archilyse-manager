import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationService } from '../../_services/navigation.service';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit, OnDestroy {
  options = [];
  current = '';

  subscriptionNavCurrent: Subscription;
  subscriptionNavOptions: Subscription;
  subscriptionNavdiagramLinkActive: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private navigationService: NavigationService
  ) {
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
  }
}
