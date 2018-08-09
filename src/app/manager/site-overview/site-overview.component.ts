import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../managerFunctions';
import { Building, Site } from '../../_models';
import { ApiFunctions } from '../apiFunctions';
import { urlPortfolio } from '../url';
import { ColumnDefinitions } from '../columnDefinitions';

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
      children: [
        { headerName: 'Site_id', field: 'site_id', width: 190, editable: false },
        { headerName: 'Name', field: 'name', width: 190, editable: true },
        { headerName: 'Description', field: 'description', width: 300, editable: true },
        {
          headerName: 'Buildings',
          field: 'buildings',
          filter: 'agNumberColumnFilter',
          width: 100,
          cellRenderer: this.viewBuildings,
          editable: false,
        },
      ],
    },
    ...ColumnDefinitions.metaUserAndData,
  ];

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  viewBuildings(params) {
    const number = params.value > 0 ? params.value : 0;
    return (
      number + `<a href='${urlPortfolio}/building#site_id=` + params.data.site_id + `' > View </a>`
    );
  }

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
      }
    );
  }

  ngOnInit() {
    /** SITES */
    ApiFunctions.get(this.http, 'sites', sites => {
      console.log('sites', sites);

      ApiFunctions.get(this.http, 'buildings', buildings => {
        console.log('buildings', buildings);

        const sitesArray = <Site[]>sites;
        const buildingsArray = <Building[]>buildings;

        sitesArray.forEach(site => {
          site.buildings = buildingsArray.filter(
            building => building.site_id === site.site_id
          ).length;
        });

        console.log('sitesArray', sitesArray);

        this.gridOptions = <GridOptions>{
          rowData: sitesArray,
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
      });
    });
  }

  delete() {
    ManagerFunctions.reactToDelete(
      this.http,
      this.selectedRows,
      this.gridOptions.api,
      'site',
      'sites',
      'site_id',
      'sites'
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
