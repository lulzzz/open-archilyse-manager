import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../../manager/managerFunctions';
import { OverlayService } from '../../_services/overlay.service';
import {environment} from '../../../environments/environment';

const urlGeoreference = environment.urlGeoreference;
const urlPortfolio = environment.urlPortfolio;

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
  georeferenced = false;
  modelStruct = false;
  ready = false;

  unitSet = false;
  buildingSet = false;
  buildingAddressSet = false;
  buildingGeorefSet = false;

  layout: any;
  api: any;

  urlRaw: any;

  constructor(private http: HttpClient, private infoDialog: OverlayService) {}

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

    if (params.colDef.field === 'simulations.view.status') {
      requireBuilding = true;
      requireGeorefLayout = true;
    } else if (params.colDef.field === 'simulations.wbs.status') {
      // Just the model structure
    } else if (params.colDef.field === 'simulations.pathways.status') {
      // Just the model structure
    } else if (params.colDef.field === 'simulations.basic_features.status') {
      // Just the model structure
    } else if (params.colDef.field === 'simulations.accoustics.status') {
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

    this.urlRaw = `${urlPortfolio}/simulation/layout/${params.data.layout_id}`;

    if (!this.unitSet) {
      this.styles.backgroundColor = '#59f0ff';
    } else if (!this.buildingSet) {
      this.styles.backgroundColor = '#52a1ff';
    } else if (!this.buildingAddressSet) {
      this.styles.backgroundColor = '#4dc3ff';
    } else if (!this.buildingGeorefSet) {
      this.styles.backgroundColor = '#59b0ff';
    } else if (!this.modelStruct) {
      this.styles.backgroundColor = '#66b9ff';
    } else if (!this.georeferenced) {
      this.styles.backgroundColor = '#6bdfff';
    } else if (params.value) {
      if (params.value === 'failed') {
        this.failed = true;
        this.styles.backgroundColor = '#ff8582';
      } else if (params.value === 'complete') {
        this.complete = true;
        this.styles.backgroundColor = '#b5d686';
      } else if (params.value === 'pending' || params.value === 'Pending') {
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
    const simsRequested = ['view', 'wbs', 'pathways', 'basic_features', 'accoustics'];
    ManagerFunctions.requestLayoutSimulations(this.http, this.layout, simsRequested, this.api);
  }
  requestStatus() {
    ManagerFunctions.requestLayoutSimulationsStatus(this.http, this.layout, this.api);
  }
  georeference() {
    const src = 'swiss_topo';
    ManagerFunctions.openLink(
      urlGeoreference + '/map/' + this.layout.layout_id + (src ? `#source=${src}` : '')
    );
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
