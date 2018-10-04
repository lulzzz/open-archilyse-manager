import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../../manager/managerFunctions';
import { OverlayService, NavigationService } from '../../_services';

@Component({
  selector: 'app-building-simulation-dpoi-renderer',
  templateUrl: './building-simulation-dpoi-renderer.component.html',
  styleUrls: ['./building-simulation-dpoi-renderer.component.scss'],
})
export class BuildingSimulationRendererDpoiComponent {
  params: any;
  value: any;
  styles: any;

  /**
   * Control of errors and different states.
   */
  pending = false;
  not_requested = false;
  failed = false;
  unknown = false;
  addressSet = false;
  complete = false;
  outdated = false;
  ready = false;

  building: any;
  api: any;

  urlRaw: any;
  urlDpoi: any;

  currentProfile;

  constructor(
    private http: HttpClient,
    private infoDialog: OverlayService,
    private navigationService: NavigationService
  ) {
    this.currentProfile = navigationService.profile.getValue();
  }

  // called on init
  agInit(params: any): void {
    this.calculateValues(params);
  }

  // Mandatory - Get the cell to refresh. Return true if the refresh succeeded, otherwise return false.
  // If you return false, the grid will remove the component from the DOM and create
  // a new component in it's place with the new values.
  refresh(params: any): boolean {
    return this.calculateValues(params);
  }

  // called on init
  calculateValues(params: any): boolean {
    this.params = params;

    if (params.colDef.field === 'simulation_statuses.dpoi.status') {
    } else {
      console.error('Column simulations', params.colDef.field);
    }

    this.value = this.params.value;
    this.building = this.params.data;
    this.api = this.params.api;
    this.styles = {};
    this.pending = false;
    this.not_requested = false;
    this.failed = false;
    this.unknown = false;
    this.complete = false;
    this.outdated = false;
    this.ready = false;
    this.addressSet = ManagerFunctions.isAddressCorrect(this.building);

    this.urlRaw = `/manager/simulation/building/${params.data.building_id}`;
    this.urlDpoi = `/manager/dpoi/${params.data.building_id}`;

    // const letterColor = '#bce6fa';
    const letterColor = '#3d383e';

    if (!this.addressSet) {
      this.styles = { width: '30%', backgroundColor: '#2e67b1', color: letterColor };
    } else if (params.value) {
      const status = params.value;

      if (status === 'failed') {
        this.failed = true;
        this.styles = { width: '60%', backgroundColor: '#ff8582', color: letterColor };
      } else if (status === 'complete') {
        this.complete = true;
        this.styles = { width: '100%', backgroundColor: '#2e67b1', color: letterColor };
      } else if (status === 'outdated') {
        this.outdated = true;
        this.complete = true;
        this.styles = { width: '100%', backgroundColor: '#2e67b1', color: letterColor };
      } else if (status === 'not_requested') {
        this.not_requested = true;
        this.styles = { width: '60%', backgroundColor: '#2e67b1', color: letterColor };
      } else if (status === 'pending' || status === 'Pending') {
        this.pending = true;
        this.styles = { width: '80%', backgroundColor: '#ffc975', color: letterColor };
      } else {
        this.ready = true;
        this.styles = { width: '60%', backgroundColor: '#2e67b1', color: letterColor };
      }
    } else {
      this.unknown = true;
      this.styles = { width: '0%', backgroundColor: '#2e67b1', color: letterColor };
    }
    return true;
  }

  requestSimulation() {
    const simsRequested = [
      {
        name: 'dpoi',
      },
    ];
    ManagerFunctions.requestBuildingSimulations(this.http, this.building, simsRequested, this.api);
  }

  requestStatus() {
    ManagerFunctions.requestBuildingSimulationsStatus(this.http, this.building, this.api);
  }

  infoOutdated() {
    this.infoDialog.open({
      data: {
        title: 'Simulation outdated',
        body: 'The georeference from this building changed after the simulation was calculated.',
        image: null,
      },
    });
  }

  infoAddress() {
    this.infoDialog.open({
      data: {
        title: 'Request simulation: Address needed',
        body:
          'In order to request the current simulation the selected building must have a valid address. <br/>' +
          'Please edit the address building details by double clicking on the cells.',
        image: null,
      },
    });
  }
}
