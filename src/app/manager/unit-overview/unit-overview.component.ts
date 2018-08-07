import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { MatCheckboxComponent } from '../../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../../_shared-components/procent-renderer/procent-renderer.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../managerFunctions';
import { Building, Layout, Unit } from '../../_models';
import { ApiFunctions } from '../apiFunctions';
import {urlPortfolio} from '../url';

@Component({
  selector: 'app-floorplan-overview',
  templateUrl: './unit-overview.component.html',
  styleUrls: ['./unit-overview.component.scss'],
})
export class UnitOverviewComponent implements OnInit, OnDestroy {
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

  columnDefs;

  buildColumDefinitions(buildings) {
    this.columnDefs = [
      { headerName: 'Unit_id', field: 'unit_id', width: 190, editable: false },
      {
        headerName: 'Building_id',
        field: 'building_id',
        width: 230,
        cellRenderer: this.viewBuilding,
        cellEditor: 'agPopupSelectCellEditor',
        cellEditorParams: {
          values: buildings.map(building => building.building_id),
        },
        editable: true,
      },
      { headerName: 'Name', field: 'name', editable: true },
      { headerName: 'Description', field: 'description', editable: true },
      {
        headerName: 'Layouts',
        field: 'layouts',
        filter: 'agNumberColumnFilter',
        width: 90,
        cellRenderer: this.viewLayouts,
        editable: false,
      },

      { headerName: 'Address Line1', field: 'line1', editable: true },
      { headerName: 'Address Line2', field: 'line2', editable: true },
      { headerName: 'Address Line3', field: 'line3', editable: true },
      {
        headerName: 'Images',
        field: 'images',
        cellRenderer: ManagerFunctions.viewImg,
        editable: false,
      },

      ...ManagerFunctions.metaUserAndData,
    ];
  }

  addRow() {
    ApiFunctions.post(
      this.http,
      'units',
      {
        address: {
          line1: 'asdf321',
          line2: '2b',
          line3: 'adf32314',
        },
        building_id: '5a8fec5c4cdf4c000b04f8cf',
        created: '2018-07-27T12:34:21.875Z',
        description: 'Optimizing for most optimum mobility inside the space.',
        images: 'http://s3-bucket-url.com/image/123',
        name: 'My unit',
        updated: '2018-07-27T12:34:21.875Z',
      },
      units => {
        console.log('units', units);
        this.gridOptions.api.updateRowData({
          add: [units],
        });
      }
    );
  }

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  viewBuilding(params) {
    return (
      params.value +
      `<a href='${urlPortfolio}/building#building_id=` +
      params.data.building_id +
      `' > View </a>`
    );
  }

  viewLayouts(params) {
    const number = params.value > 0 ? params.value : 0;
    return number + `<a href='${urlPortfolio}/layout#unit_id=` + params.data.unit_id + `' > View </a>`;
  }

  ngOnInit() {
    /** UNITS */

    ApiFunctions.get(this.http, 'buildings', buildings => {
      console.log('buildings', buildings);
      ApiFunctions.get(this.http, 'layouts', layouts => {
        console.log('layouts', layouts);
        ApiFunctions.get(this.http, 'units', units => {
          console.log('units', units);

          const buildingsArray = <Building[]>buildings;
          const layoutsArray = <Layout[]>layouts;
          const unitsArray = <Unit[]>units;

          this.buildColumDefinitions(buildings);

          unitsArray.forEach(unit => {
            unit.layouts = layoutsArray.filter(layout => layout.unit_id === unit.unit_id).length;
          });

          this.gridOptions = <GridOptions>{
            rowData: unitsArray,
            columnDefs: this.columnDefs,

            /** Pagination */
            ...ManagerFunctions.pagination,
            ...ManagerFunctions.columnOptions,

            onCellValueChanged: params => {
              ManagerFunctions.reactToEdit(this.http, params, 'unit_id', 'units', this.gridOptions.api);
            },

            onFilterChanged: params => {
              const model = params.api.getFilterModel();
              this.filterModelSet = model !== null || Object.keys(model).length > 0;
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
        });
      });
    });
  }

  delete() {
    ManagerFunctions.reactToDelete(
      this.http,
      this.selectedRows,
      this.gridOptions.api,
      'unit',
      'units',
      'unit_id',
      'units'
    );
  }

  clearSelection() {
    ManagerFunctions.clearSelection(this.gridOptions.api);
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
