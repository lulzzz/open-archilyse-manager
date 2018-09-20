import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiFunctions } from '../apiFunctions';
import { NavigationService } from '../../_services';

@Component({
  selector: 'app-simulation-overview',
  templateUrl: './simulation-overview.component.html',
  styleUrls: ['./simulation-overview.component.scss'],
})
export class SimulationOverviewComponent implements OnInit, OnDestroy {
  /**
   * Loading and general error
   */

  generalError = null;
  loading = true;

  /**
   * Local variables
   */

  buildingId;
  layoutId;

  json;
  currentProfile;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private navigationService: NavigationService
  ) {
    this.currentProfile = navigationService.profile.getValue();
  }

  getSimulations(url) {
    ApiFunctions.get(
      this.http,
      url,
      simulations => {
        this.loading = false;
        this.loadSimulations(simulations);
      },
      error => {
        this.loading = false;
        this.generalError = `<div class="title">Unknown error requesting the API data: </div> ${
          error.message
        }`;
      }
    );
  }

  ngOnInit() {
    this.buildingId = this.route.snapshot.params['buildingId'];
    this.layoutId = this.route.snapshot.params['layoutId'];

    // If building Id is defined we request the simulations.
    if (this.buildingId) {
      this.getSimulations(`buildings/${this.buildingId}/simulations`);
    }

    // If layout Id is defined we request the simulations.
    if (this.layoutId) {
      this.getSimulations(`layouts/${this.layoutId}/simulations`);
    }
  }

  /**
   * We use "ngx-json-viewer" to display the results:
   * https://www.npmjs.com/package/ngx-json-viewer
   * @param simulations
   */
  loadSimulations(simulations) {
    this.json = simulations;
  }

  backPage() {
    window.history.back();
  }

  ngOnDestroy(): void {}
}
