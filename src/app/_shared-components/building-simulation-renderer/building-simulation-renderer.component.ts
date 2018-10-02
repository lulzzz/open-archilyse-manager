import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../../manager/managerFunctions';
import { OverlayService, NavigationService } from '../../_services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-building-simulation-renderer',
  templateUrl: './building-simulation-renderer.component.html',
  styleUrls: ['./building-simulation-renderer.component.scss'],
})
export class BuildingSimulationRendererComponent {
  params: any;
  value: any;
  html: any;
  styles: any;

  /**
   * Control of errors and different states.
   */
  pending = false;
  not_requested = false;
  failed = false;
  unknown = false;
  complete = false;
  georeferenced = false;
  addressSet = false;
  ready = false;

  building: any;
  api: any;

  urlRaw: any;
  urlPotencialView: any;

  currentProfile;

  constructor(
    private http: HttpClient,
    private router: Router,
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

  calculateValues(params): boolean {
    this.params = params;

    if (params.colDef.field === 'simulation_statuses.potential_view.status') {
      this.urlPotencialView = `/manager/potentialView/${params.data.building_id}`;
    } else if (params.colDef.field === 'simulation_statuses.accoustics.status') {
    } else if (params.colDef.field === 'simulation_statuses.dpoi.status') {
    } else {
      console.error('Column simulations', params.colDef.field);
    }

    this.value = this.params.value;
    this.building = this.params.data;
    this.api = this.params.api;
    this.styles = {};
    this.not_requested = false;
    this.pending = false;
    this.failed = false;
    this.unknown = false;
    this.complete = false;
    this.ready = false;

    this.addressSet = ManagerFunctions.isAddressCorrect(this.building);
    this.georeferenced = ManagerFunctions.isReferencedBuilding(this.building);

    this.urlRaw = `/manager/simulation/building/${params.data.building_id}`;

    // const letterColor = '#bce6fa';
    const letterColor = '#3d383e';

    if (!this.addressSet) {
      this.styles = { width: '30%', backgroundColor: '#2e67b1', color: letterColor };
    } else if (!this.georeferenced) {
      this.styles = { width: '60%', backgroundColor: '#2e67b1', color: letterColor };
    } else if (params.value) {
      const status = params.value;
      if (status === 'failed') {
        this.failed = true;
        this.styles = { width: '80%', backgroundColor: '#ff8582', color: letterColor };
      } else if (status === 'complete') {
        this.complete = true;
        this.styles = { width: '80%', backgroundColor: '#2e67b1', color: letterColor };
      } else if (status === 'not_requested') {
        this.not_requested = true;
        this.styles = { width: '80%', backgroundColor: '#2e67b1', color: letterColor };
      } else if (status === 'pending' || status === 'Pending') {
        this.pending = true;
        this.styles = { width: '80%', backgroundColor: '#ffc975', color: letterColor };
      } else {
        this.ready = true;
        this.styles = { width: '100%', backgroundColor: '#2e67b1', color: letterColor };
      }
    } else {
      this.unknown = true;
      this.styles = { width: '0%', backgroundColor: '#2e67b1', color: letterColor };
    }

    return true;
  }

  requestSimulation() {
    console.log('this.building', this.building);

    // We request all the floors
    const numberOfFloors = this.building.number_of_floors ? this.building.number_of_floors : 1;
    const floorArray = [];
    for (let i = 0; i < numberOfFloors; i += 1) {
      floorArray.push(i);
    }

    // Only
    const simsRequested = [
      {
        name: 'potential_view',
        parameters: {
          floors: floorArray,
        },
      },
    ];
    ManagerFunctions.requestBuildingSimulations(this.http, this.building, simsRequested, this.api);
  }
  requestStatus() {
    ManagerFunctions.requestBuildingSimulationsStatus(this.http, this.building, this.api);
  }
  georeference() {
    const src = 'swiss_topo';
    this.router.navigate(['georeference', 'map', this.building.building_id], {
      fragment: src ? `source=${src}` : null,
    });
    /**
    ManagerFunctions.openLink(
      urlGeoreference + '/map/' + this.building.building_id + (src ? `#source=${src}` : '')
    );
     */
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
  infoGeoreference() {
    this.infoDialog.open({
      data: {
        title: 'Request simulation: Georeference needed',
        body:
          'In order to request the current simulation the selected building must be georeferenced. <br/>' +
          'Please use the georeference tool to identify the the specific building for the given address.',
        image: null,
      },
    });
  }
}
