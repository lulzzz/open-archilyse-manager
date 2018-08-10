import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../managerFunctions';
import { Building, Site, Unit } from '../../_models';
import { ApiFunctions } from '../apiFunctions';
import { urlGeoreference, urlPortfolio } from '../url';
import { CellRender } from '../cellRender';
import { ColumnDefinitions } from '../columnDefinitions';

@Component({
  selector: 'app-building-overview',
  templateUrl: './building-overview.component.html',
  styleUrls: ['./building-overview.component.scss'],
})
export class BuildingOverviewComponent implements OnInit, OnDestroy {
  /**
   * TABLE DOCUMENTATION
   * https://www.ag-grid.com/angular-getting-started/
   */

  generalError = null;
  loading = true;

  selectedNodes = [];
  selectedRows = [];

  gridApi;
  gridColumnApi;

  filterModelSet = false;

  gridOptions;

  fragment_sub: Subscription;
  columnDefs;

  buildColumDefinitions(sites) {
    this.columnDefs = [
      {
        headerName: 'Site',
        children: [
          {
            headerName: 'Id',
            field: 'site_id',
            width: 230,
            cellRenderer: this.viewSite,
            cellEditor: 'agPopupSelectCellEditor',
            cellEditorParams: {
              values: sites.map(site => site.site_id),
            },
            editable: true,
          },
        ],
      },
      {
        headerName: 'Building',
        children: [
          {
            headerName: 'Id',
            field: 'building_id',
            width: 190,
            editable: false,
            cellClass: 'idCell',
          },
          { headerName: 'Name', field: 'name', editable: true },
          { headerName: 'Description', field: 'description', editable: true },
        ],
      },
      {
        headerName: 'Building Address',
        children: [
          {
            headerName: 'Country',
            field: 'address.country',
            editable: true,
          },
          { headerName: 'City', field: 'address.city', editable: true },
          { headerName: 'Street', field: 'address.street', editable: true },
          { headerName: 'Street Nr', field: 'address.street_nr', width: 100, editable: true },
          { headerName: 'Postal Code', field: 'address.postal_code', width: 110, editable: true },
        ],
      },
      {
        headerName: 'Units',
        children: [
          {
            headerName: 'Units',
            field: 'units',
            filter: 'agNumberColumnFilter',
            width: 90,
            cellRenderer: this.viewUnits,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Layouts',
            field: 'layouts',
            filter: 'agNumberColumnFilter',
            width: 90,
            editable: false,
            cellClass: 'readOnly',
          },
        ],
      },
      {
        headerName: 'Georeference',
        children: [
          // { headerName: 'Building_reference', field: 'building_reference', editable: true },
          { headerName: 'Swiss topo', field: 'building_reference.swiss_topo', editable: true },
          {
            headerName: 'Open_street_maps',
            field: 'building_reference.open_street_maps',
            editable: true,
          },
        ],
      },
      {
        headerName: 'Simulations',
        children: [
          {
            headerName: 'Potential view',
            field: 'simulations.potential_view',
            cellRenderer: CellRender.viewSimulation,
            width: 140,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Accoustics',
            field: 'simulations.accoustics',
            cellRenderer: CellRender.viewSimulation,
            width: 140,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'DPOI',
            field: 'simulations.dpoi',
            cellRenderer: CellRender.viewSimulation,
            width: 100,
            editable: false,
            cellClass: 'readOnly',
          },
        ],
      },
      {
        headerName: 'Progress',
        children: [
          {
            headerName: 'Layouts',
            field: 'progressLayout',
            cellRenderer: 'procentRenderer',
            filter: 'agNumberColumnFilter',
            cellRendererParams: { editable: false },
            cellClass: 'readOnly',
          },
        ],
      },
      {
        headerName: 'Layout Simulations ',
        children: ColumnDefinitions.progressSimsLayout,
      },
      {
        headerName: 'Images',
        children: [
          {
            headerName: 'Images',
            field: 'images',
            cellRenderer: CellRender.viewImg,
            editable: true,
          },
        ],
      },
      ...ColumnDefinitions.metaUserAndData,
    ];
  }

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  viewSite(params) {
    return (
      params.value +
      `<a href='${urlPortfolio}/site#site_id=` +
      params.data.site_id +
      `' > View </a>`
    );
  }

  viewUnits(params) {
    const number = params.value > 0 ? params.value : 0;
    return (
      number +
      `<a href='${urlPortfolio}/unit#building_id=` +
      params.data.building_id +
      `' > View </a>`
    );
  }

  ngOnInit() {
    /** BUILDINGS */
    ManagerFunctions.requestAllData(
      this.http,
      (sitesArray, buildingsArray, unitsArray, layoutsArray) => {
        console.log('DATA', sitesArray, buildingsArray, unitsArray, layoutsArray);

        this.loading = false;

        this.buildColumDefinitions(sitesArray);

        buildingsArray.forEach(building => {
          const progressResult = ManagerFunctions.progressOutOfBuildings(
            [building],
            unitsArray,
            layoutsArray
          );

          building.units = progressResult.numberOfUnits;
          building.layouts = progressResult.numberOfLayouts;
          building.progressLayout = progressResult.progressOfLayouts;
        });

        this.gridOptions = <GridOptions>{
          rowData: buildingsArray,
          columnDefs: this.columnDefs,

          /** Pagination */
          ...ColumnDefinitions.pagination,
          ...ColumnDefinitions.columnOptions,

          onCellValueChanged: params => {
            ManagerFunctions.reactToEdit(
              this.http,
              params,
              'building_id',
              'buildings',
              this.gridOptions.api
            );
          },

          onFilterChanged: params => {
            const model = params.api.getFilterModel();
            this.filterModelSet = model !== null && Object.keys(model).length > 0;
            console.log('model', model);
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
      },
      error => {
        this.generalError = `<div class="title">Unknown error requesting the API data: </div> ${
          error.message
        }`;
      }
    );
  }

  clearSelection() {
    ManagerFunctions.clearSelection(this.gridOptions.api);
  }

  selectNotGeoreferenced() {
    this.gridOptions.api.selectAll();
    const nodes = this.gridOptions.api.getSelectedNodes();
    nodes.forEach(node => {
      if (ManagerFunctions.isReferencedBuilding(node.data)) {
        node.setSelected(false);
      }
    });
  }

  addRow() {
    ApiFunctions.post(
      this.http,
      'buildings',
      {
        address: {
          city: '', // St. Gallen
          country: '', // Switzerland
          postal_code: '', // 9000
          street: '', // Ruhbergstrasse
          street_nr: '', // 44
        },

        building_reference: {
          open_street_maps: '',
          swiss_topo: '',
        },
        description: '',
        images: '',
        name: '',
      },
      building => {
        console.log('buildings', building);
        this.gridOptions.api.updateRowData({
          add: [building],
        });
      },
      ManagerFunctions.showErroruser
    );
  }

  delete() {
    ManagerFunctions.reactToDelete(
      this.http,
      this.selectedRows,
      this.gridOptions.api,
      'building',
      'buildings',
      'building_id',
      'buildings'
    );
  }

  georeference() {
    const nodes = this.gridOptions.api.getSelectedNodes();

    if (nodes.length === 1) {
      const node = nodes[0];
      ManagerFunctions.openNewWindow(urlGeoreference + '/map/' + node.data.building_id);
    } else if (nodes.length > 1) {
      const building_ids = nodes.map(node => node.data.building_id);
      const list = building_ids.join('\t\n') + '\t\n';
      ManagerFunctions.openNewWindow(urlGeoreference + '/multiple#list=' + list);
    }
  }

  clearFilters() {
    this.filterModelSet = false;
    this.gridApi.setFilterModel(null);
  }

  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }

  /**
   * startSimulations
   */
  getSimulationStatus() {
    const nodes = this.gridOptions.api.getSelectedNodes();
    const buildings = nodes.map(node => node.data);
    buildings.forEach(building => {
      console.log('get Building simulation status for ', building.building_id);
      ApiFunctions.get(
        this.http,
        'buildings/' + building.building_id + '/simulations/status',
        result => {
          console.log('result ', result);
        },
        error => {
          console.error(error);
        }
      );
    });
  }

  startSimulations() {
    const nodes = this.gridOptions.api.getSelectedNodes();
    const buildings = nodes.map(node => node.data);

    const georefbuildings = buildings.filter(building =>
      ManagerFunctions.isReferencedBuilding(building)
    );

    if (georefbuildings.length !== buildings.length) {
      ManagerFunctions.showWarning(
        'Not Georeferenced buildings',
        `There are ${buildings.length -
          georefbuildings.length} buildings in your selection that are not georeferenced. Those buildings would be skipped.`,
        `Skip and continue`,
        confirmed => {
          if (confirmed) {
            this.startSimulationsViaBuildings(buildings);
          }
        }
      );
    } else {
      this.startSimulationsViaBuildings(buildings);
    }
  }

  startSimulationsViaBuildings(buildings) {
    buildings.forEach(building => {
      console.log('Start Building simulations for ', building.building_id);
      ApiFunctions.post(
        this.http,
        'buildings/' + building.building_id + '/simulations',
        {
          simulation_packages: ['dpoi'],
        },
        result => {
          if (ManagerFunctions.isReferencedBuilding(building)) {
            console.log('result', result, building.building_id);
          }
        },
        ManagerFunctions.showErroruser
      );
    });
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
