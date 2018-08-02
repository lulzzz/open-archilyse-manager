import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { MatCheckboxComponent } from '../../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../../_shared-components/procent-renderer/procent-renderer.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ManagerFunctions } from '../managerFunctions';
import { HttpClient } from '@angular/common/http';

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

  columnDefs = [
    {
      headerName: 'Country',
      field: 'country',
      cellRenderer: this.viewCountry,
      editable: false,
    },
    {
      headerName: 'Buildings',
      field: 'buildings',
      filter: 'agNumberColumnFilter',
      cellRenderer: this.viewBuildings,
      width: 100,
      editable: false,
    },
    {
      headerName: 'Units',
      field: 'units',
      filter: 'agNumberColumnFilter',
      cellRenderer: this.viewUnits,
      width: 100,
      editable: false,
    },
    {
      headerName: 'Progress',
      field: 'progress',
      cellRenderer: 'procentRenderer',
      filter: 'agNumberColumnFilter',
      cellRendererParams: { editable: false },
    },
    ...ManagerFunctions.progress,
  ];

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  viewCountry(params) {
    const country = params.value ? params.value : 'Not defined';
    return country + ` <a href='/manager/region#country=` + params.value + `' > View </a>`;
  }

  viewBuildings(params) {
    const number = params.value > 0 ? params.value : 0;
    return (
      number +
      ` <a href='/manager/building#address.country=` +
      params.data.country +
      `' > View </a>`
    );
  }

  viewUnits(params) {
    const number = params.value > 0 ? params.value : 0;
    return (
      number + ` <a href='/manager/unit#address.country=` + params.data.country + `' > View </a>`
    );
  }

  ngOnInit() {
    ManagerFunctions.requestAllData(
      this.http,
      (sitesArray, buildingsArray, unitsArray, layoutsArray) => {
        console.log('DATA', sitesArray, buildingsArray, unitsArray, layoutsArray);

        const countries = buildingsArray.map(building => building.address.country);
        const countriesNoDuplicates = countries.filter(
          (item, pos) => countries.indexOf(item) == pos
        );

        const rowData = countriesNoDuplicates.map(country => {
          const buildingsThisCountry = buildingsArray.filter(
            building => building.address.country === country
          );
          const numBuildings = buildingsThisCountry.length;
          const buildingsReferenced = buildingsThisCountry.filter(building =>
            ManagerFunctions.isReferenced(building)
          );

          const numBuildingsReferenced = buildingsReferenced.length;

          const buildingsThisCountryIds = buildingsThisCountry.map(b => b.building_id);
          const unitsThisCountry = unitsArray.filter(unit =>
            buildingsThisCountryIds.includes(unit.building_id)
          );

          const numUnits = unitsThisCountry.length;
          const progressBuildings =
            numBuildings > 0 ? numBuildingsReferenced * 100 / numBuildings : 0;
          return {
            country: country,
            buildings: numBuildings,
            units: numUnits,
            progress: progressBuildings,
            delivered: false,
            structured: false,
            digitized: false,
            TLM: false,
            LOD1: false,
            LOD2: false,
            ALTI: false,
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
          rowData: rowData,
          columnDefs: this.columnDefs,
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
