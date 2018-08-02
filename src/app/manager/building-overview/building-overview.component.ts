import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { MatCheckboxComponent } from '../../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../../_shared-components/procent-renderer/procent-renderer.component';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../managerFunctions';

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

  selectedNodes = [];
  selectedRows = [];

  gridApi;
  gridColumnApi;

  filterModelSet = false;

  gridOptions;

  fragment_sub: Subscription;

  columnDefs = [
    { headerName: 'Building_id', field: 'building_id', width: 190, editable: false },
    {
      headerName: 'Site_id',
      field: 'site_id',
      cellRenderer: this.viewSite,
      width: 230,
      editable: true,
    },

    { headerName: 'Name', field: 'name', editable: true },
    { headerName: 'Description', field: 'description', editable: true },
    {
      headerName: 'Images',
      field: 'images',
      cellRenderer: ManagerFunctions.viewImg,
      editable: true,
    },
    {
      headerName: 'Country',
      field: 'address.country',
      editable: true,
    },
    { headerName: 'City', field: 'address.city', editable: true },
    { headerName: 'Street', field: 'address.street', editable: true },
    { headerName: 'Street_nr', field: 'address.street_nr', editable: true },
    { headerName: 'Postal_code', field: 'address.postal_code', editable: true },

    // { headerName: 'Building_reference', field: 'building_reference', editable: true },
    { headerName: 'Ref - Swiss topo', field: 'building_reference.swiss_topo', editable: true },
    {
      headerName: 'Ref - Open_street_maps',
      field: 'building_reference.open_street_maps',
      editable: true,
    },
    {
      headerName: 'Units',
      field: 'units',
      filter: 'agNumberColumnFilter',
      cellRenderer: this.viewUnits,
      editable: false,
    },
    ...ManagerFunctions.metaUserAndData,
  ];

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  viewSite(params) {
    return params.value + `<a href='/manager/site#site_id=` + params.data.site_id + `' > View </a>`;
  }

  viewUnits(params) {
    const number = params.value > 0 ? params.value : 0;
    return (
      number + `<a href='/manager/unit#building_id=` + params.data.building_id + `' > View </a>`
    );
  }

  ngOnInit() {
    /** BUILDINGS */
    this.http.get('http://api.archilyse.com/v1/units').subscribe(units => {
      console.log('units', units);
      const unitsArray = <any[]>units;

      this.http.get('http://api.archilyse.com/v1/buildings').subscribe(buildings => {
        console.log('buildings', buildings);

        const buildingsArray = <any[]>buildings;

        buildingsArray.forEach(building => {
          building.units = unitsArray.filter(
            unit => unit.building_id === building.building_id
          ).length;
        });

        this.gridOptions = <GridOptions>{
          rowData: buildingsArray,
          columnDefs: this.columnDefs,

          onCellValueChanged: params => {
            ManagerFunctions.reactToEdit(this.http, params, 'building_id', 'buildings');
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
          // rowHeight: 48, recommended row height for material design data grids,
          frameworkComponents: {
            checkboxRenderer: MatCheckboxComponent,
            procentRenderer: ProcentRendererComponent,
          },
          enableColResize: true,
          enableSorting: true,
          enableFilter: true,
          rowSelection: 'multiple',
        };
      }, console.error);
    }, console.error);
  }

  clearSelection() {
    ManagerFunctions.clearSelection(this.gridOptions.api);
  }

  selectNotGeoreferenced() {
    this.gridOptions.api.selectAll();
    const nodes = this.gridOptions.api.getSelectedNodes();
    nodes.forEach(node => {
      if (ManagerFunctions.isReferenced(node.data)) {
        node.setSelected(false);
      }
    });
  }

  addRow() {
    this.http
      .post('http://api.archilyse.com/v1/buildings', {
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
        site_id: '',
      })
      .subscribe(building => {
        console.log('buildings', building);
        this.gridOptions.api.updateRowData({
          add: [building],
        });
      }, console.error);
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
      ManagerFunctions.openNewWindow('/georeference/map/' + node.data.building_id);
    } else if (nodes.length > 1) {
      const building_ids = nodes.map(node => node.data.building_id);
      const list = building_ids.join('\n');
      ManagerFunctions.openNewWindow('/georeference?buildingList=' + list);
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
}
