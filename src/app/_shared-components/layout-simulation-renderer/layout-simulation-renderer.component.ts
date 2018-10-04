import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../../manager/managerFunctions';
import { OverlayService, NavigationService } from '../../_services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout-simulation-renderer',
  templateUrl: './layout-simulation-renderer.component.html',
  styleUrls: ['./layout-simulation-renderer.component.scss'],
})
export class LayoutSimulationRendererComponent {
  params: any;
  value: any;
  html: any;
  styles: any;

  /**
   * Control of errors and different states.
   */

  pending = false;
  failed = false;
  unknown = false;
  complete = false;
  outdated = false;
  georeferenced = false;
  modelStruct = false;
  ready = false;
  not_requested = false;

  unitSet = false;
  buildingSet = false;
  buildingAddressSet = false;
  buildingGeorefSet = false;

  layout: any;
  api: any;

  urlRaw: any;

  currentProfile;

  urlView: any;

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

    let requireGeorefLayout = false;
    let requireBuilding = false;

    if (params.colDef.field === 'simulation_statuses.view.status') {
      requireBuilding = true;
      requireGeorefLayout = true;
      this.urlView = `/manager/viewSim/${params.data.layout_id}`;
    } else if (params.colDef.field === 'simulation_statuses.wbs.status') {
      // Just the model structure
    } else if (params.colDef.field === 'simulation_statuses.pathways.status') {
      // Just the model structure
    } else if (params.colDef.field === 'simulation_statuses.basic_features.status') {
      // Just the model structure
    } else if (params.colDef.field === 'simulation_statuses.accoustics.status') {
      // Just the model structure
    } else {
      console.error('Column simulations', params.colDef.field);
    }

    this.value = this.params.value;
    this.layout = this.params.data;
    this.api = this.params.api;

    /**
     * Reset values
     */
    this.styles = {};
    this.pending = false;
    this.failed = false;
    this.unknown = false;
    this.complete = false;
    this.outdated = false;
    this.ready = false;
    this.georeferenced = false;
    this.modelStruct = false;

    this.unitSet =
      !requireBuilding ||
      (!!this.layout.unit_id && !!this.layout.unit && !!this.layout.unit.unit_id);

    this.buildingSet =
      !requireBuilding ||
      (!!this.layout.building_id && !!this.layout.building && !!this.layout.building.building_id);
    this.buildingAddressSet =
      !requireBuilding || ManagerFunctions.isAddressCorrect(this.layout.building);
    this.buildingGeorefSet =
      !requireBuilding || ManagerFunctions.isReferencedBuilding(this.layout.building);
    this.georeferenced =
      !requireBuilding || !requireGeorefLayout || ManagerFunctions.isReferencedLayout(this.layout);

    this.modelStruct = ManagerFunctions.isDigitalizedLayout(this.layout);

    this.urlRaw = `/manager/simulation/layout/${params.data.layout_id}`;

    // const letterColor = '#bce6fa';
    const letterColor = '#3d383e';

    if (!this.unitSet) {
      this.styles = { width: '15%', backgroundColor: '#2e67b1', color: letterColor };
    } else if (!this.buildingSet) {
      this.styles = { width: '30%', backgroundColor: '#2e67b1', color: letterColor };
    } else if (!this.buildingAddressSet) {
      this.styles = { width: '45%', backgroundColor: '#2e67b1', color: letterColor };
    } else if (!this.buildingGeorefSet) {
      this.styles = { width: '60%', backgroundColor: '#2e67b1', color: letterColor };
    } else if (!this.modelStruct) {
      this.styles = { width: '70%', backgroundColor: '#2e67b1', color: letterColor };
    } else if (!this.georeferenced) {
      this.styles = { width: '80%', backgroundColor: '#2e67b1', color: letterColor };
    } else if (params.value) {
      if (params.value === 'failed') {
        this.failed = true;
        this.styles = { width: '90%', backgroundColor: '#ff8582', color: letterColor };
      } else if (params.value === 'complete') {
        this.complete = true;
        this.styles = { width: '100%', backgroundColor: '#2e67b1', color: letterColor };
      } else if (status === 'outdated') {
        this.complete = true;
        this.outdated = true;
        this.styles = { width: '100%', backgroundColor: '#2e67b1', color: letterColor };
      } else if (params.value === 'not_requested') {
        this.not_requested = true;
        this.styles = { width: '90%', backgroundColor: '#2e67b1', color: letterColor };
      } else if (params.value === 'pending' || params.value === 'Pending') {
        this.pending = true;
        this.styles = { width: '95%', backgroundColor: '#ffc975', color: letterColor };
      } else {
        this.ready = true;
        this.styles = { width: '85%', backgroundColor: '#2e67b1', color: letterColor };
      }
    } else {
      this.unknown = true;
      this.styles = { width: '0%', backgroundColor: '#2e67b1', color: letterColor };
    }

    return true;
  }

  requestSimulation() {
    // const simsRequested = ['view']; // , 'wbs', 'pathways', 'basic_features', 'accoustics'
    const simsRequested = [
      {
        name: 'view',
      },
    ];
    ManagerFunctions.requestLayoutSimulations(this.http, this.layout, simsRequested, this.api);
  }
  requestStatus() {
    ManagerFunctions.requestLayoutSimulationsStatus(this.http, this.layout, this.api);
  }
  georeference() {
    const src = 'swiss_topo';

    this.router.navigate(['georeference', 'map', this.layout.layout_id], {
      fragment: src ? `source=${src}` : null,
    });
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

  infoUnit() {
    this.infoDialog.open({
      data: {
        title: 'Request simulation: Unit needed',
        body:
          'In order to request the current simulation the selected layout must have a valid unit. <br/>' +
          'Please edit the unit_id of this layout.',
        image: null,
      },
    });
  }

  infoBuilding() {
    this.infoDialog.open({
      data: {
        title: 'Request simulation: Building needed',
        body:
          'In order to request the current simulation the selected layout must have a valid unit that is linked to a building. <br/>' +
          'Please edit the building_id from the unit assigned to this layout.',
        image: null,
      },
    });
  }
  infoBuildingAddress() {
    this.infoDialog.open({
      data: {
        title: 'Request simulation: Building Address needed',
        body:
          'In order to request the current simulation the selected layout must be linked a building with a valid address. <br/>' +
          'Please edit the address building details by double clicking on the cells.',
        image: null,
      },
    });
  }
  infoBuildingGeoref() {
    this.infoDialog.open({
      data: {
        title: 'Request simulation: Georeference needed',
        body:
          'In order to request the current simulation the selected layout must be linked to a georeferenced building. <br/>' +
          'Please use the georeference tool to identify the the specific building for the given address.',
        image: null,
      },
    });
  }
  infoLayoutGeoref() {
    this.infoDialog.open({
      data: {
        title: 'Request simulation: Georeference needed',
        body:
          'In order to request the current simulation the selected layout must be georeferenced. <br/>' +
          'Please use the georeference tool to place the model structure in the building.',
        image: null,
      },
    });
  }
  infoLayoutModelStrucutre() {
    this.infoDialog.open({
      data: {
        title: 'Request simulation: Model Structure needed',
        body:
          'In order to request the current simulation the selected layout must be have a valid model structure. <br/>' +
          'Please assign a model structure to the current layout.',
        image: null,
      },
    });
  }
}
