import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../../manager/managerFunctions';
import { OverlayService } from '../../_services/overlay.service';
import { environment } from '../../../environments/environment';
import {NavigationService} from '../../_services/navigation.service';

const urlPortfolio = environment.urlPortfolio;

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
  ready = false;

  building: any;
  api: any;

  urlRaw: any;
  urlDpoi: any;

  currentProfile;

  constructor(private http: HttpClient, private infoDialog: OverlayService,
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

    if (params.colDef.field === 'simulations.dpoi.status') {
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
    this.ready = false;
    this.addressSet = ManagerFunctions.isAddressCorrect(this.building);

    this.urlRaw = `${urlPortfolio}/simulation/building/${params.data.building_id}`;
    this.urlDpoi = `${urlPortfolio}/dpoi/${params.data.building_id}`;

    if (!this.addressSet) {
      this.styles.backgroundColor = '#59f0ff';
    } else if (params.value) {
      if (params.value === 'failed') {
        this.failed = true;
        this.styles.backgroundColor = '#ff8582';
      } else if (params.value === 'complete') {
        this.complete = true;
        this.styles.backgroundColor = '#b5d686';
      } else if (params.value === 'not_requested') {
        this.not_requested = true;
        this.styles.backgroundColor = '#4ebeff';
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
    const simsRequested = ['dpoi'];
    ManagerFunctions.requestBuildingSimulations(this.http, this.building, simsRequested, this.api);
  }

  requestStatus() {
    ManagerFunctions.requestBuildingSimulationsStatus(this.http, this.building, this.api);
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
