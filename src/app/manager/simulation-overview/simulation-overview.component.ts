import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiFunctions } from '../apiFunctions';

@Component({
  selector: 'app-simulation-overview',
  templateUrl: './simulation-overview.component.html',
  styleUrls: ['./simulation-overview.component.scss'],
})
export class SimulationOverviewComponent implements OnInit, OnDestroy {
  generalError = null;
  loading = true;

  buildingId;
  layoutId;

  code;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.buildingId = this.route.snapshot.params['buildingId'];
    this.layoutId = this.route.snapshot.params['layoutId'];

    if (this.buildingId) {
      ApiFunctions.get(
        this.http,
        `buildings/${this.buildingId}/simulations`,
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
    if (this.layoutId) {
      ApiFunctions.get(
        this.http,
        `layouts/${this.layoutId}/simulations`,
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
  }

  loadSimulations(simulations) {
    this.code = JSON.stringify(simulations, null, 4);
  }

  backPage() {
    window.history.back();
  }

  ngOnDestroy(): void {}
}
