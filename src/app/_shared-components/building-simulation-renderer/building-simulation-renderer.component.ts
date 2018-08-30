import { Component } from '@angular/core';
import { urlGeoreference, urlPortfolio } from '../../manager/url';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../../manager/managerFunctions';
import { OverlayService } from '../../_services/overlay.service';

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
  pending: boolean = false;
  failed: boolean = false;
  unknown: boolean = false;
  complete: boolean = false;
  georeferenced: boolean = false;
  addressSet: boolean = false;
  ready: boolean = false;

  building: any;
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

    if (params.colDef.field === 'simulations.potential_view.status') {
    } else if (params.colDef.field === 'simulations.accoustics.status') {
    } else if (params.colDef.field === 'simulations.dpoi.status') {
    } else {
      console.error('Column simulations', params.colDef.field);
    }

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
    this.georeferenced = ManagerFunctions.isReferencedBuilding(this.building);

    this.urlRaw = `${urlPortfolio}/simulation/building/${params.data.building_id}`;

    if (!this.addressSet) {
      this.styles.backgroundColor = '#59f0ff';
    } else if (!this.georeferenced) {
      this.styles.backgroundColor = '#5cc8ff';
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
    // `
    //       Available <div class="cell-sim-request" >Request</div><div class="cell-sim-info" [popper]="infoExcelPopper" (click)="showInfoExcel()">
    //         <i class="fa fa-info-circle"></i>
    //       </div>`

    return true;
  }

  requestSimulation() {
    const simsRequested = ['dpoi'];
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
          'In order to request the current simulation the selected building must have a valid address. <br/>Please edit the address building details by double clicking on the cells.',
        image: null,
      },
    });
  }
  infoGeoreference() {
    this.infoDialog.open({
      data: {
        title: 'Request simulation: Georeference needed',
        body:
          'In order to request the current simulation the selected building must be georeferenced. <br/>Please use the georeference tool to identify the the specific building for the given address.',
        image: null,
      },
    });
  }
}
