import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../../manager/managerFunctions';
import { OverlayService, NavigationService } from '../../_services';
import { environment } from '../../../environments/environment';

const urlGeoreference = environment.urlGeoreference;
const urlPortfolio = environment.urlPortfolio;

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
      this.urlPotencialView = `${urlPortfolio}/potentialView/${params.data.building_id}`;
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

    this.urlRaw = `${urlPortfolio}/simulation/building/${params.data.building_id}`;

    if (!this.addressSet) {
      this.styles.backgroundColor = '#59f0ff';
    } else if (!this.georeferenced) {
      this.styles.backgroundColor = '#5cc8ff';
    } else if (params.value) {
      const status = params.value;
      if (status === 'failed') {
        this.failed = true;
        this.styles.backgroundColor = '#ff8582';
      } else if (status === 'complete') {
        this.complete = true;
        this.styles.backgroundColor = '#b5d686';
      } else if (status === 'not_requested') {
        this.not_requested = true;
        this.styles.backgroundColor = '#4ebeff';
      } else if (status === 'pending' || status === 'Pending') {
        this.pending = true;
        this.styles.backgroundColor = '#ffc975';
      } else {
        this.ready = true;
      }
    } else {
      this.unknown = true;
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
    ManagerFunctions.openLink(
      urlGeoreference + '/map/' + this.building.building_id + (src ? `#source=${src}` : '')
    );
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
