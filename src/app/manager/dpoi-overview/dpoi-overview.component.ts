import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from '../../../../node_modules/rxjs/Subscription';
import { ColumnDefinitions } from '../columnDefinitions';
import { CellRender } from '../cellRender';
import { HttpClient } from '../../../../node_modules/@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiFunctions } from '../apiFunctions';
import { ManagerFunctions } from '../managerFunctions';
import { GridOptions } from 'ag-grid';
import { urlPortfolio } from '../url';

@Component({
  selector: 'app-dpoi-overview',
  templateUrl: './dpoi-overview.component.html',
  styleUrls: ['./dpoi-overview.component.scss'],
})
export class DpoiOverviewComponent implements OnInit, OnDestroy {
  /**
   * TABLE DOCUMENTATION
   * https://www.ag-grid.com/angular-getting-started/
   */
  generalError = null;
  loading = true;

  buildingId;

  selectedNodes = [];
  selectedRows = [];

  created;
  updated;
  status;

  gridApi;
  gridColumnApi;

  filterModelSet = false;

  gridOptions;

  fragment_sub: Subscription;

  columnDefs = [
    {
      headerName: 'Simulation',
      children: [
        {
          headerName: 'Name',
          field: 'name',
          width: 190,
          editable: false,
          cellClass: 'readOnly',
        },
      ],
    },
    {
      headerName: 'Foot',
      children: [
        {
          headerName: 'Distance',
          field: 'foot.distance',
          width: 90,
          cellRenderer: CellRender.distance,
          editable: false,
          cellClass: 'right readOnly',
        },
        {
          headerName: 'Duration',
          field: 'foot.duration',
          width: 100,
          cellRenderer: CellRender.duration,
          editable: false,
          cellClass: 'right readOnly',
        },
        {
          headerName: 'Score',
          field: 'foot.score',
          width: 80,
          cellRenderer: CellRender.score,
          editable: false,
          cellClass: 'right readOnly',
        },
      ],
    },
    {
      headerName: 'Bike',
      children: [
        {
          headerName: 'Distance',
          field: 'bike.distance',
          width: 90,
          cellRenderer: CellRender.distance,
          editable: false,
          cellClass: 'right readOnly',
        },
        {
          headerName: 'Duration',
          field: 'bike.duration',
          width: 100,
          cellRenderer: CellRender.duration,
          editable: false,
          cellClass: 'right readOnly',
        },
        {
          headerName: 'Score',
          field: 'bike.score',
          width: 80,
          cellRenderer: CellRender.score,
          editable: false,
          cellClass: 'right readOnly',
        },
      ],
    },
    {
      headerName: 'Car',
      children: [
        {
          headerName: 'Distance',
          field: 'car.distance',
          width: 90,
          cellRenderer: CellRender.distance,
          editable: false,
          cellClass: 'right readOnly',
        },
        {
          headerName: 'Duration',
          field: 'car.duration',
          width: 100,
          cellRenderer: CellRender.duration,
          editable: false,
          cellClass: 'right readOnly',
        },
        {
          headerName: 'Score',
          field: 'car.score',
          width: 80,
          cellRenderer: CellRender.score,
          editable: false,
          cellClass: 'right readOnly',
        },
      ],
    },
    {
      headerName: 'Flight',
      children: [
        {
          headerName: 'Distance',
          field: 'flight.distance',
          width: 90,
          cellRenderer: CellRender.distance,
          editable: false,
          cellClass: 'right readOnly',
        },
        {
          headerName: 'Duration',
          field: 'flight.duration',
          width: 100,
          cellRenderer: CellRender.duration,
          editable: false,
          cellClass: 'right readOnly',
        },
        {
          headerName: 'Score',
          field: 'flight.score',
          width: 80,
          cellRenderer: CellRender.score,
          editable: false,
          cellClass: 'right readOnly',
        },
      ],
    },
    {
      headerName: 'Coordinates',
      children: [
        {
          headerName: 'Latitude',
          field: 'latitude',
          width: 150,
          cellRenderer: CellRender.latLan,
          editable: false,
          cellClass: 'right readOnly',
        },
        {
          headerName: 'Longitude',
          field: 'longitude',
          width: 150,
          cellRenderer: CellRender.latLan,
          editable: false,
          cellClass: 'right readOnly',
        },
      ],
    },
  ];

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.buildingId = this.route.snapshot.params['buildingid'];

    if (this.buildingId) {
      ApiFunctions.get(
        this.http,
        `buildings/${this.buildingId}/simulations`,
        simulations => {
          this.loading = false;

          if (simulations && simulations.dpoi) {
            this.created = simulations.dpoi.created;
            this.updated = simulations.dpoi.updated;
            this.status = simulations.dpoi.status;

            const result = simulations.dpoi.result;
            const simKeys = Object.keys(simulations.dpoi.result);
            const simulationsArray = simKeys.map(simKey => {
              const res = result[simKey];
              return {
                name: simKey,
                bike: res.bike,
                car: res.car,
                flight: res.flight,
                foot: res.foot,
                latitude: res.latitude,
                longitude: res.longitude,
              };
            });

            this.gridOptions = <GridOptions>{
              rowData: simulationsArray,
              columnDefs: this.columnDefs,

              /** Pagination */
              ...ColumnDefinitions.pagination,
              ...ColumnDefinitions.columnOptions,

              onCellValueChanged: params => {
                ManagerFunctions.reactToEdit(
                  this.http,
                  params,
                  'site_id',
                  'sites',
                  this.gridOptions.api
                );
              },

              onFilterChanged: params => {
                const model = params.api.getFilterModel();
                this.filterModelSet = model !== null && Object.keys(model).length > 0;
              },
              onSelectionChanged: () => {
                this.selectedNodes = this.gridOptions.api.getSelectedNodes();
                this.selectedRows = this.gridOptions.api.getSelectedRows();
              },
              onGridReady: params => {
                this.gridApi = params.api;
                this.gridColumnApi = params.columnApi;
                // this.gridOptions.api.sizeColumnsToFit();

                this.fragment_sub = ManagerFunctions.setDefaultFilters(
                  this.route,
                  this.columnDefs,
                  this.gridApi
                );
              },
            };
          } else {
            this.generalError = `<div class="title"> DPOI simulation not found </div>`;
          }
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

  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }

  backPage() {
    window.history.back();
  }

  seeRawData() {
    window.location.href = `${urlPortfolio}/simulation/building/${this.buildingId}`;
  }

  /**
   * Export functions
   */
  export() {
    this.gridOptions.api.exportDataAsCsv({
      columnSeparator: ';',
    });
  }
  exportSelected() {
    this.gridOptions.api.exportDataAsCsv({
      onlySelected: true,
      columnSeparator: ';',
    });
  }
}
