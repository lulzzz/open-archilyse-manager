import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../managerFunctions';
import { Building, Layout, Unit } from '../../_models';
import { ApiFunctions } from '../apiFunctions';
import { urlPortfolio } from '../url';
import { CellRender } from '../cellRender';
import { ColumnDefinitions } from '../columnDefinitions';

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
  generalError = null;
  loading = true;

  selectedNodes = [];
  selectedRows = [];

  buildingsArray;

  gridApi;
  gridColumnApi;

  filterModelSet = false;

  gridOptions;

  fragment_sub: Subscription;

  columnDefs;

  buildColumDefinitions(buildings) {
    this.columnDefs = [
      {
        headerName: 'Building',
        children: [
          {
            headerName: 'Building_id',
            field: 'building_id',
            width: 230,
            cellRenderer: this.viewBuilding,
            cellEditor: 'agPopupSelectCellEditor',
            cellEditorParams: {
              values: ['', ...buildings.map(building => building.building_id)],
            },
            editable: true,
          },
          {
            headerName: 'Georeferenced',
            field: 'building_referenced',
            cellRenderer: 'checkboxRenderer',
            width: 100,
            cellRendererParams: { editable: false },
            cellClass: 'readOnly',
          },
        ],
      },
      {
        headerName: 'Unit',
        children: [
          {
            headerName: 'Id',
            field: 'unit_id',
            width: 190,
            editable: false,
            cellClass: 'idCell',
          },
          { headerName: 'Name', field: 'name', editable: true },
          { headerName: 'Description', field: 'description', editable: true },
        ],
      },
      {
        headerName: 'Layouts',
        children: [
          {
            headerName: 'Amount',
            field: 'layouts',
            filter: 'agNumberColumnFilter',
            width: 90,
            cellRenderer: this.viewLayouts,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Progress',
            field: 'progressLayout',
            cellRenderer: 'procentRenderer',
            filter: 'agNumberColumnFilter',
            cellRendererParams: { editable: false },
            cellClass: 'readOnly',
          },
        ],
      },
      {
        headerName: 'Unit address',
        children: [
          { headerName: 'Line1', field: 'line1', editable: true },
          { headerName: 'Line2', field: 'line2', editable: true },
          { headerName: 'Line3', field: 'line3', editable: true },
        ],
      },
      {
        headerName: 'Images',
        children: [
          {
            headerName: 'Images',
            field: 'images',
            cellRenderer: CellRender.viewImg,
            editable: false,
            cellClass: 'readOnly',
          },
        ],
      },
      ...ColumnDefinitions.metaUserAndData,
    ];
  }

  addRow() {
    ApiFunctions.post(
      this.http,
      'units',
      {
        name: '',
        description: '',
        address: {
          line1: '',
          line2: '',
          line3: '',
        },
      },
      units => {
        console.log('units', units);
        this.gridOptions.api.updateRowData({
          add: [units],
        });
      },
      ManagerFunctions.showErroruser
    );
  }

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  viewBuilding(params) {
    if (params.value && params.value !== '' && params.value !== 'None') {
      return (
        params.value +
        `<a href='${urlPortfolio}/building#building_id=` +
        params.data.building_id +
        `' > View </a>`
      );
    }
    return '';
  }

  viewLayouts(params) {
    const number = params.value > 0 ? params.value : 0;
    return (
      number + `<a href='${urlPortfolio}/layout#unit_id=` + params.data.unit_id + `' > View </a>`
    );
  }

  unitReactionToEdit(nodeData, element) {
    // if the new Layout has new unit id, we update the building data.
    if (element.building_id) {
      const buildingThisUnit = this.buildingsArray.find(
        building => building.building_id === nodeData.building_id
      );

      nodeData['building_referenced'] =
        buildingThisUnit && ManagerFunctions.isReferencedBuilding(buildingThisUnit);
    }
  }

  ngOnInit() {
    /** UNITS */

    ManagerFunctions.requestAllData(
      this.http,
      (sitesArray, buildingsArray, unitsArray, layoutsArray) => {
        console.log('DATA', sitesArray, buildingsArray, unitsArray, layoutsArray);

        this.loading = false;

        this.buildingsArray = buildingsArray;
        this.buildColumDefinitions(buildingsArray);

        unitsArray.forEach(unit => {
          const layoutsThisUnit = layoutsArray.filter(layout => layout.unit_id === unit.unit_id);

          const numLayouts = layoutsThisUnit.length;
          unit.layouts = numLayouts;
          let progressLayout = 0;
          if (numLayouts > 0) {
            const numReferenced = layoutsThisUnit.filter(layout =>
              ManagerFunctions.isReferencedLayout(layout)
            ).length;
            progressLayout = numReferenced * 100 / numLayouts;
          }
          unit['progressLayout'] = progressLayout;

          const buildingThisUnit = this.buildingsArray.find(
            building => building.building_id === unit.building_id
          );

          unit['building_referenced'] =
            buildingThisUnit && ManagerFunctions.isReferencedBuilding(buildingThisUnit);
        });

        this.gridOptions = <GridOptions>{
          rowData: unitsArray,
          columnDefs: this.columnDefs,

          /** Pagination */
          ...ColumnDefinitions.pagination,
          ...ColumnDefinitions.columnOptions,

          onCellValueChanged: params => {
            ManagerFunctions.reactToEdit(
              this.http,
              params,
              'unit_id',
              'units',
              this.gridOptions.api,
              this.unitReactionToEdit.bind(this)
            );
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
      },
      error => {
        this.generalError = `<div class="title">Unknown error requesting the API data: </div> ${
          error.message
        }`;
      }
    );
  }

  duplicate() {
    this.selectedRows.forEach(selectedRow => {
      const newRow = selectedRow;

      // Id is not duplicated
      delete newRow.unit_id;

      // Calculated are not duplicated
      delete newRow.building_referenced;
      delete newRow.layouts;
      delete newRow.progressLayout;

      // Control fields are not duplicated
      delete newRow.org_id;
      delete newRow.user_id;
      delete newRow.updated;
      delete newRow.created;

      ApiFunctions.post(
        this.http,
        'units',
        newRow,
        unit => {
          console.log('unit', unit);
          this.gridOptions.api.updateRowData({
            add: [unit],
          });
        },
        ManagerFunctions.showErroruser
      );
    });
  }

  delete() {
    let layouts = 0;

    this.selectedRows.forEach(site => {
      layouts += site.layouts;
    });

    let warning = null;
    if (layouts > 0) {
      if (layouts > 1) {
        warning = `There're ${layouts} layout associated`;
      } else if (layouts === 1) {
        warning = `There's a layout associated`;
      }
    }

    ManagerFunctions.reactToDelete(
      this.http,
      this.selectedRows,
      this.gridOptions.api,
      'unit',
      'units',
      'unit_id',
      'units',
      warning
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
