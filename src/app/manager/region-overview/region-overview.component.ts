import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { ManagerFunctions } from '../../_shared-libraries/ManagerFunctions';
import { HttpClient } from '@angular/common/http';
import { CellRender } from '../../_shared-libraries/CellRender';
import { ColumnDefinitions } from '../../_shared-libraries/ColumnDefinitions';
import {
  exportOptions,
  exportSelectedOptions,
} from '../../_shared-libraries/ExcelManagement';
import { NavigationService } from '../../_services';

/**
 * API region groping overview table
 */
@Component({
  selector: 'app-region-overview',
  templateUrl: './region-overview.component.html',
  styleUrls: ['./region-overview.component.scss'],
})
export class RegionOverviewComponent implements OnInit, OnDestroy {

  /** String container of any error */
  generalError = null;

  /** True to start and false once all the data is loaded */
  loading = true;

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

  columnDefs;

  /** user profile */
  currentProfile;
  filtersHuman;

  /**
   * Subscriptions
   */
  fragment_sub: Subscription;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private navigationService: NavigationService
  ) {
    this.currentProfile = navigationService.profile.getValue();
  }

  buildColumDefinitions() {
    this.columnDefs = [
      {
        headerName: 'Location',
        children: [
          {
            headerName: 'Country',
            field: 'country',
            cellRenderer: CellRender.viewCountryInCountry,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'City',
            field: 'city',
            editable: false,
            cellClass: 'readOnly',
          },
        ],
      },
      {
        headerName: 'Count',
        children: ColumnDefinitions.getBuildingsUnitsLayouts(
          'linkRenderer',
          { type: 'viewBuildingsCity' },
          null,
          null
        ),
      },
      {
        headerName: 'Progress',
        children: ColumnDefinitions.progressProcents,
      },
      {
        headerName: 'Control',
        children: ColumnDefinitions.progress,
      },
      /**
      {
        headerName: 'Building Simulations ',
        children: ColumnDefinitions.progressSimsBuilding,
      },
      {
        headerName: 'Layout Simulations ',
        children: ColumnDefinitions.progressSimsLayout,
      },*/
    ];
  }

  ngOnInit() {
    ManagerFunctions.requestAllData(
      this.http,
      (sitesArray, buildingsArray, unitsArray, layoutsArray) => {
        this.loading = false;

        this.buildColumDefinitions();

        const countries = buildingsArray.map(building =>
          ManagerFunctions.getCountry(building)
        );
        const countriesNoDuplicates = countries.filter(
          (item, pos) => countries.indexOf(item) === pos
        );

        const countryCitiesNoDuplicates = [];
        countriesNoDuplicates.forEach(countryVal => {
          const buildingsThisCountry = buildingsArray.filter(
            building => ManagerFunctions.getCountry(building) === countryVal
          );

          const cities = buildingsThisCountry.map(building =>
            ManagerFunctions.getCity(building)
          );
          const citiesNoDuplicates = cities.filter(
            (item, pos) => cities.indexOf(item) === pos
          );

          citiesNoDuplicates.forEach(cityVal => {
            countryCitiesNoDuplicates.push({
              country: countryVal && countryVal.length ? countryVal : '',
              city: cityVal && cityVal.length ? cityVal : '',
            });
          });
        });

        const rowsData = countryCitiesNoDuplicates.map(countryCity => {
          const countryVal =
            countryCity.country && countryCity.country.length
              ? countryCity.country
              : '';
          const cityVal =
            countryCity.city && countryCity.city.length ? countryCity.city : '';

          const buildingsThisCity = buildingsArray.filter(
            building =>
              ManagerFunctions.getCountry(building) === countryVal &&
              ManagerFunctions.getCity(building) === cityVal
          );

          const progressResult = ManagerFunctions.progressOutOfBuildings(
            buildingsThisCity,
            unitsArray,
            layoutsArray
          );

          return {
            country: countryVal,
            city: cityVal,
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

        this.gridOptions = {
          rowData: rowsData,
          columnDefs: this.columnDefs,

          /** Pagination */
          ...ColumnDefinitions.pagination,
          ...ColumnDefinitions.columnOptions,

          onFilterChanged: params => {
            const model = params.api.getFilterModel();
            this.filterModelSet =
              model !== null && Object.keys(model).length > 0;
            this.filtersHuman = ManagerFunctions.calculateHumanFilters(
              model,
              this.filterModelSet,
              sitesArray,
              buildingsArray,
              unitsArray,
              layoutsArray
            );
          },
          onSelectionChanged: () => {
            if (this.gridOptions && this.gridOptions.api) {
              this.selectedNodes = this.gridOptions.api.getSelectedNodes();
              this.selectedRows = this.gridOptions.api.getSelectedRows();
            }
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

  /** Clean all the selected rows from the Ag-grid table */
  clearSelection() {
    ManagerFunctions.clearSelection(this.gridOptions.api);
  }

  /** Clean all the filters from the Ag-grid table */
  clearFilters() {
    this.filterModelSet = false;
    this.gridApi.setFilterModel(null);
  }

  /** Unsubscribe before destroying */
  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }

  /**
   * Export functions
   */

  /** Export everything */
  export() {
    this.gridOptions.api.exportDataAsCsv(exportOptions);
  }
  /** Export selected nodes only */
  exportSelected() {
    this.gridOptions.api.exportDataAsCsv(exportSelectedOptions);
  }
}
