import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { MatCheckboxComponent } from '../../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../../_shared-components/procent-renderer/procent-renderer.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ManagerFunctions } from '../managerFunctions';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-region-overview',
  templateUrl: './region-overview.component.html',
  styleUrls: ['./region-overview.component.scss'],
})
export class RegionOverviewComponent implements OnInit, OnDestroy {
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
    { headerName: 'Country', field: 'country', cellRenderer: this.viewCountry, editable: false },
    { headerName: 'City', field: 'city', editable: false },
    {
      headerName: 'Buildings',
      field: 'buildings',
      filter: 'agNumberColumnFilter',
      cellRenderer: this.viewBuildings,
      editable: false,
    },
    {
      headerName: 'Units',
      field: 'units',
      filter: 'agNumberColumnFilter',
      cellRenderer: this.viewUnits,
      editable: false,
    },
    {
      headerName: 'Progress',
      field: 'progress',
      cellRenderer: 'procentRenderer',
      filter: 'agNumberColumnFilter',
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'Delivered',
      field: 'delivered',
      cellRenderer: 'checkboxRenderer',
      cellRendererParams: { editable: true },
    },
    {
      headerName: 'Structured',
      field: 'structured',
      cellRenderer: 'checkboxRenderer',
      cellRendererParams: { editable: true },
    },
    {
      headerName: 'Digitized',
      field: 'digitized',
      cellRenderer: 'checkboxRenderer',
      cellRendererParams: { editable: true },
    },
    {
      headerName: 'TLM-OBJ',
      field: 'TLM',
      cellRenderer: 'checkboxRenderer',
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'LOD1-OBJ',
      field: 'LOD1',
      cellRenderer: 'checkboxRenderer',
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'LOD2-OBJ',
      field: 'LOD2',
      cellRenderer: 'checkboxRenderer',
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'ALTI-OBJ',
      field: 'ALTI',
      cellRenderer: 'checkboxRenderer',
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'Georeferenced',
      field: 'georeferenced',
      cellRenderer: 'checkboxRenderer',
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'Data Complete',
      field: 'data',
      cellRenderer: 'checkboxRenderer',
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'DPOI',
      field: 'DPOI',
      cellRenderer: 'checkboxRenderer',
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'View & Sun',
      field: 'view',
      cellRenderer: 'checkboxRenderer',
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'Acoustics',
      field: 'acoustics',
      cellRenderer: 'checkboxRenderer',
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'WBS',
      field: 'WBS',
      cellRenderer: 'checkboxRenderer',
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'BasicFeatures',
      field: 'basicFeatures',
      cellRenderer: 'checkboxRenderer',
      cellRendererParams: { editable: false },
    },
  ];

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  viewCountry(params) {
    const country = params.value ? params.value : 'Not defined';
    return country + ` <a href='/manager/country#country=` + params.value + `' > View </a>`;
  }

  viewBuildings(params) {
    const number = params.value > 0 ? params.value : 0;
    return (
      number + ` <a href='/manager/building#address.city=` + params.data.city + `' > View </a>`
    );
  }

  viewUnits(params) {
    const number = params.value > 0 ? params.value : 0;
    return number + ` <a href='/manager/unit#address.city=` + params.data.city + `' > View </a>`;
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

        const countryCitiesNoDuplicates = [];
        countriesNoDuplicates.forEach(country => {
          const buildingsThisCountry = buildingsArray.filter(
            building => building.address.country === country
          );

          const cities = buildingsThisCountry.map(building => building.address.city);
          const citiesNoDuplicates = cities.filter((item, pos) => cities.indexOf(item) == pos);

          citiesNoDuplicates.forEach(city => {
            countryCitiesNoDuplicates.push({
              country: country,
              city: city,
            });
          });
        });

        console.log('citiesNoDuplicates ', countryCitiesNoDuplicates);

        const rowData = countryCitiesNoDuplicates.map(countryCity => {
          const country = countryCity.country;
          const city = countryCity.city;

          const buildingsThisCity = buildingsArray.filter(
            building => building.address.country === country && building.address.city === city
          );

          const numBuildings = buildingsThisCity.length;
          const buildingsReferenced = buildingsThisCity.filter(building =>
            ManagerFunctions.isReferenced(building)
          );

          const numBuildingsReferenced = buildingsReferenced.length;

          const buildingsThisCountryIds = buildingsThisCity.map(b => b.building_id);
          const unitsThisCountry = unitsArray.filter(unit =>
            buildingsThisCountryIds.includes(unit.building_id)
          );

          const numUnits = unitsThisCountry.length;
          const progressBuildings =
            numBuildings > 0 ? numBuildingsReferenced * 100 / numBuildings : 0;
          return {
            country: country,
            city: city,
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
          rowData: rowData, // this.rowData,
          columnDefs: this.columnDefs,
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
