import { Component } from '@angular/core';
import { urlPortfolio } from '../../manager/url';
import { HttpClient } from '@angular/common/http';
import { ApiFunctions } from '../../manager/apiFunctions';
import { ManagerFunctions } from '../../manager/managerFunctions';
import { ActivatedRoute } from '@angular/router';
import { OverlayService } from '../../_services/overlay.service';

@Component({
  selector: 'app-building-simulation-dopi-renderer',
  templateUrl: './building-simulation-dopi-renderer.component.html',
  styleUrls: ['./building-simulation-dopi-renderer.component.scss'],
})
export class BuildingSimulationRendererDpoiComponent {
  params: any;
  value: any;
  styles: any;

  pending: boolean = false;
  failed: boolean = false;
  unknown: boolean = false;
  addressSet: boolean = false;
  complete: boolean = false;
  ready: boolean = false;

  building: any;
  api: any;

  urlRaw: any;
  urlDpoi: any;

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

  // called on init
  calculateValues(params: any): boolean {
    this.params = params;
    this.value = this.params.value;
    this.building = this.params.data;
    this.api = this.params.api;
    this.styles = {};
    this.pending = false;
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
          'In order to request the current simulation the selected building must have a valid address. <br/>Please edit the address building details by double clicking on the cells.',
        image: null,
      },
    });
  }
}
