import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../managerFunctions';
import { Site } from '../../_models';
import { ApiFunctions } from '../apiFunctions';
import { ColumnDefinitions } from '../columnDefinitions';
import { CellRender } from '../cellRender';
import {
  convertFileToWorkbook,
  exportOptions,
  exportSelectedOptions,
  getRows,
  showInfoExcel,
} from '../excel';
import { OverlayService } from '../../_services/overlay.service';

@Component({
  selector: 'app-site-overview',
  templateUrl: './site-overview.component.html',
  styleUrls: ['./site-overview.component.scss'],
})
export class SiteOverviewComponent implements OnInit, OnDestroy {
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

  columnDefs = [
    {
      headerName: 'Site',
      openByDefault: true,
      headerTooltip: 'Site entity main properties',
      children: [
        {
          headerName: 'Site Id',
          field: 'site_id',
          columnGroupShow: 'open',
          width: 190,
          editable: false,
          cellClass: 'idCell',
        },
        { headerName: 'Name', field: 'name', width: 190, editable: true },
        {
          headerName: 'Description',
          columnGroupShow: 'open',
          field: 'description',
          width: 300,
          editable: true,
        },
      ],
    },
    {
      headerName: 'Count',
      headerTooltip: 'Number of elements assigned to this site',
      children: ColumnDefinitions.getBuildingsUnitsLayouts(CellRender.viewBuildingsSite, null),
    },
    {
      headerName: 'Progress',
      headerTooltip: 'Procent of georeferenced buildings and layouts',
      children: ColumnDefinitions.progressProcents,
    },
    {
      headerName: 'Building Simulations ',
      children: ColumnDefinitions.progressSimsBuilding,
    },
    {
      headerName: 'Layout Simulations ',
      children: ColumnDefinitions.progressSimsLayout,
    },
    ...ColumnDefinitions.metaUserAndData,
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private infoDialog: OverlayService
  ) {}

  addRow() {
    ApiFunctions.post(
      this.http,
      'sites',
      {
        description: '',
        name: '',
      },
      site => {
        this.gridOptions.api.updateRowData({
          add: [site],
        });
      },
      ManagerFunctions.showErroruser
    );
  }

  ngOnInit() {
    /** SITES */
    ManagerFunctions.requestAllData(
      this.http,
      (sitesArray, buildingsArray, unitsArray, layoutsArray) => {
        this.loading = false;

        sitesArray.forEach(site => {
          const buildingsThisSite = buildingsArray.filter(
            building => building.site_id === site.site_id
          );

          const progressResult = ManagerFunctions.progressOutOfBuildings(
            buildingsThisSite,
            unitsArray,
            layoutsArray
          );

          site.buildings = progressResult.numberOfBuildings;
          site.units = progressResult.numberOfUnits;
          site.layouts = progressResult.numberOfLayouts;
          site.progress = progressResult.progressOfBuildings;
          site.progressLayout = progressResult.progressOfLayouts;
        });

        this.gridOptions = {
          rowData: sitesArray,
          columnDefs: this.columnDefs,

          /** Pagination */
          ...ColumnDefinitions.pagination,
          ...ColumnDefinitions.columnOptions,

          getRowNodeId: data => data.site_id,
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
      const newRow = {};
      Object.assign(newRow, ...selectedRow);

      // Id is not duplicated
      delete newRow['site_id'];

      // Control fields are not duplicated
      delete newRow['org_id'];
      delete newRow['user_id'];
      delete newRow['updated'];
      delete newRow['created'];

      ApiFunctions.post(
        this.http,
        'sites',
        newRow,
        site => {
          this.gridOptions.api.updateRowData({
            add: [site],
          });
        },
        ManagerFunctions.showErroruser
      );
    });
  }

  delete() {
    console.log('this.selectedRows ', this.selectedRows);

    let buildings = 0;
    let layouts = 0;
    let units = 0;

    this.selectedRows.forEach(site => {
      buildings += site.buildings;
      layouts += site.layouts;
      units += site.units;
    });

    let warning = null;
    if (buildings > 0) {
      let waringBuildings;
      if (buildings > 1) {
        waringBuildings = `There're ${buildings} buildings`;
      } else {
        waringBuildings = `There's a building`;
      }

      let waringUnits;
      if (units > 1) {
        waringUnits = `${units} units`;
      } else if (units === 1) {
        waringUnits = `an unit `;
      } else {
        waringUnits = `no units `;
      }

      let waringLayouts;
      if (layouts > 1) {
        waringLayouts = `${layouts} layouts`;
      } else if (layouts === 1) {
        waringLayouts = `a layout `;
      } else {
        waringLayouts = `no layouts `;
      }

      warning = `${waringBuildings}, ${waringUnits} and ${waringLayouts} associated.`;
    }

    ManagerFunctions.reactToDelete(
      this.http,
      this.selectedRows,
      this.gridOptions.api,
      'site',
      'sites',
      'site_id',
      'sites',
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
   * Import / Export functions
   * https://stackoverflow.com/questions/11832930/html-input-file-accept-attribute-file-type-csv
   */
  showInfoExcel() {
    this.infoDialog.open(showInfoExcel);
  }
  importExcel(files) {
    if (files.length === 1) {
      convertFileToWorkbook(files[0], result => {
        const dictionarySites = {};
        dictionarySites['Site Id'] = 'site_id';
        dictionarySites['Name'] = 'name';
        dictionarySites['Description'] = 'description';
        const allRows = getRows(result, dictionarySites);

        console.log('allRows ', allRows);
        allRows.forEach(oneRow => {
          if (oneRow.site_id && oneRow.site_id !== null && oneRow.site_id !== '') {
            const site_id = oneRow.site_id;
            delete oneRow.site_id;
            ApiFunctions.patch(
              this.http,
              'sites/' + site_id,
              oneRow,
              site => {
                const node = this.gridOptions.api.getRowNode(site_id);
                node.setData(site);
              },
              ManagerFunctions.showErrorUserNoReload
            );
          } else {
            ApiFunctions.post(
              this.http,
              'sites',
              oneRow,
              site => {
                this.gridOptions.api.updateRowData({
                  add: [site],
                });
              },
              ManagerFunctions.showErrorUserNoReload
            );
          }
        });
      });
    }
  }

  export() {
    this.gridOptions.api.exportDataAsCsv(exportOptions);
  }
  exportSelected() {
    this.gridOptions.api.exportDataAsCsv(exportSelectedOptions);
  }
}
