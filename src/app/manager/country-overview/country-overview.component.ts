import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { MatCheckboxComponent } from '../../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../../_shared-components/procent-renderer/procent-renderer.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { ManagerFunctions } from '../managerFunctions';
import { HttpClient } from '@angular/common/http';
import { urlGeoreference, urlPortfolio } from '../url';

@Component({
  selector: 'app-country-overview',
  templateUrl: './country-overview.component.html',
  styleUrls: ['./country-overview.component.scss'],
})
export class CountryOverviewComponent implements OnInit, OnDestroy {
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

  buildColumDefinitions() {
    this.columnDefs = [
      {
        headerName: 'Country',
        field: 'country',
        cellRenderer: this.viewCountry,
        editable: false,
      },
      ...ManagerFunctions.getBuildingsUnitsLayouts(
        ManagerFunctions.viewBuildingsCountry,
        ManagerFunctions.viewUnitsCountry
      ),
      ...ManagerFunctions.progress,
    ];
  }

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  viewCountry(params) {
    const country = params.value ? params.value : 'Not defined';
    return country + ` <a href='${urlPortfolio}/region#country=` + params.value + `' > View </a>`;
  }

  ngOnInit() {
    ManagerFunctions.requestAllData(
      this.http,
      (sitesArray, buildingsArray, unitsArray, layoutsArray) => {
        console.log('DATA', sitesArray, buildingsArray, unitsArray, layoutsArray);

        this.buildColumDefinitions();

        const countries = buildingsArray.map(building => ManagerFunctions.getCountry(building));
        const countriesNoDuplicates = countries.filter(
          (item, pos) => countries.indexOf(item) === pos
        );

        const rowsData = countriesNoDuplicates.map(countryVal => {
          const buildingsThisCountry = buildingsArray.filter(
            building => ManagerFunctions.getCountry(building) === countryVal
          );
          const progressResult = ManagerFunctions.progressOutOfBuildings(
            buildingsThisCountry,
            unitsArray,
            layoutsArray
          );

          return {
            country: countryVal,
            buildings: progressResult.numberOfBuildings,
            units: progressResult.numberOfUnits,
            layouts: progressResult.numberOfLayouts,
            progress: progressResult.progressOfBuildings,
            progressLayout: progressResult.progressOfLayouts,
            delivered: false,
            structured: false,
            digitized: false,
            georeferenced: false,
            data: false,
            DPOI: false,
            view: false,
            acoustics: false,
            WBS: false,
            basicFeatures: false,
          };
        });

        this.gridOptions = <GridOptions>{
          rowData: rowsData,
          columnDefs: this.columnDefs,

          /** Pagination */
          ...ManagerFunctions.pagination,
          ...ManagerFunctions.columnOptions,

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
      }
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
