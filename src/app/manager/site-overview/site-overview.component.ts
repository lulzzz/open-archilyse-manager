import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { MatCheckboxComponent } from '../../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../../_shared-components/procent-renderer/procent-renderer.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../managerFunctions';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

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
    { headerName: 'Site_id', field: 'site_id', editable: false },
    { headerName: 'Name', field: 'name', editable: true },
    { headerName: 'Description', field: 'description', editable: true },
    {
      headerName: 'Buildings',
      field: 'buildings',
      filter: 'agNumberColumnFilter',
      cellRenderer: this.viewBuildings,
      editable: false,
    },
    ...ManagerFunctions.metaUserAndData
  ];

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  viewBuildings(params) {
    const number = params.value > 0 ? params.value : 0;
    return number + `<a href='/manager/building#site_id=` + params.data.site_id + `' > View </a>`;
  }

  addRow() {
    this.http
      .post('http://api.archilyse.com/v1/sites', {
        description: '',
        name: '',
      })
      .subscribe(site => {
        this.gridOptions.api.updateRowData({
          add: [site],
        });
      }, console.error);
  }

  ngOnInit() {
    /** SITES */

    this.http.get('http://api.archilyse.com/v1/buildings').subscribe(buildings => {
      console.log('buildings', buildings);
      const buildingsArray = <any[]>buildings;
      this.http.get('http://api.archilyse.com/v1/sites').subscribe(sites => {
        console.log('sites', sites);
        const sitesArray = <any[]>sites;

        sitesArray.forEach(site => {
          site.buildings = buildingsArray.filter(
            building => building.site_id === site.site_id
          ).length;
        });

        console.log('sitesArray', sitesArray);

        this.gridOptions = <GridOptions>{
          rowData: sitesArray,
          columnDefs: this.columnDefs,

          onCellValueChanged: params => {
            ManagerFunctions.reactToEdit(this.http, params, 'site_id', 'sites');
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
            this.gridOptions.api.sizeColumnsToFit();
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
}
