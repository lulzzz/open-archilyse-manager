import { Component, OnInit } from '@angular/core';
import {GridOptions} from 'ag-grid';
import {MatCheckboxComponent} from '../../_shared-components/mat-checkbox/mat-checkbox.component';
import {ProcentRendererComponent} from '../../_shared-components/procent-renderer/procent-renderer.component';

@Component({
  selector: 'app-region-overview',
  templateUrl: './region-overview.component.html',
  styleUrls: ['./region-overview.component.scss']
})
export class RegionOverviewComponent implements OnInit {

  /**
   * TABLE DOCUMENTATION
   * https://www.ag-grid.com/angular-getting-started/
   */

  gridApi;
  gridColumnApi;

  filterModelSet = false;

  gridOptions;

  columnDefs = [
    {headerName: 'Country', field: 'country',  editable: false},
    {headerName: 'Region', field: 'region',  editable: false},
    {headerName: 'Apartments', field: 'apartments',  editable: false},
    {headerName: 'Progress', field: 'progress',  cellRenderer: 'procentRenderer',
      filter: 'agNumberColumnFilter', cellRendererParams: {editable: false}},
    {headerName: 'Delivered', field: 'delivered', cellRenderer: 'checkboxRenderer', cellRendererParams: {editable: true}},
    {headerName: 'Structured', field: 'structured', cellRenderer: 'checkboxRenderer', cellRendererParams: {editable: true}},
    {headerName: 'Digitized', field: 'digitized', cellRenderer: 'checkboxRenderer', cellRendererParams: {editable: true}},
    {headerName: 'TLM-OBJ', field: 'TLM', cellRenderer: 'checkboxRenderer', cellRendererParams: {editable: false}},
    {headerName: 'LOD1-OBJ', field: 'LOD1', cellRenderer: 'checkboxRenderer', cellRendererParams: {editable: false}},
    {headerName: 'LOD2-OBJ', field: 'LOD2', cellRenderer: 'checkboxRenderer', cellRendererParams: {editable: false}},
    {headerName: 'ALTI-OBJ', field: 'ALTI', cellRenderer: 'checkboxRenderer', cellRendererParams: {editable: false}},
    {headerName: 'Georeferenced', field: 'georeferenced', cellRenderer: 'checkboxRenderer', cellRendererParams: {editable: false}},
    {headerName: 'Data Complete', field: 'data', cellRenderer: 'checkboxRenderer', cellRendererParams: {editable: false}},
    {headerName: 'DPOI', field: 'DPOI', cellRenderer: 'checkboxRenderer', cellRendererParams: {editable: false}},
    {headerName: 'View & Sun', field: 'view', cellRenderer: 'checkboxRenderer', cellRendererParams: {editable: false}},
    {headerName: 'Acoustics', field: 'acoustics', cellRenderer: 'checkboxRenderer', cellRendererParams: {editable: false}},
    {headerName: 'WBS', field: 'WBS', cellRenderer: 'checkboxRenderer', cellRendererParams: {editable: false}},
    {headerName: 'BasicFeatures', field: 'basicFeatures', cellRenderer: 'checkboxRenderer', cellRendererParams: {editable: false}},
  ];

  rowData = [
    {
      country: 'Switzerland',
      region: 'Rebstein',
      progress: 100,
      apartments: 24,
      delivered: true,
      structured: true,
      digitized: true,
      TLM: true,
      LOD1: true,
      LOD2: true,
      ALTI: true,
      georeferenced: true,
      data: true,
      DPOI: true,
      view: true,
      acoustics: true,
      WBS: true,
      basicFeatures: true,
    },
    {
      country: 'Switzerland',
      region: 'Steinach',
      progress: 90,
      apartments: 30,
      delivered: true,
      structured: true,
      digitized: true,
      TLM: true,
      LOD1: true,
      LOD2: true,
      ALTI: true,
      georeferenced: true,
      data: true,
      DPOI: true,
      view: true,
      acoustics: true,
      WBS: true,
      basicFeatures: true,
    },
    {
      country: 'Switzerland',
      region: 'Schlieren',
      progress: 60,
      apartments: 48,
      delivered: true,
      structured: true,
      digitized: true,
      TLM: true,
      LOD1: true,
      LOD2: true,
      ALTI: true,
      georeferenced: true,
      data: true,
      DPOI: true,
      view: true,
      acoustics: true,
      WBS: true,
      basicFeatures: true,
    },
    {
      country: 'Switzerland',
      region: 'St. Gallen',
      progress: 17,
      apartments: 125,
      delivered: true,
      structured: true,
      digitized: true,
      TLM: true,
      LOD1: true,
      LOD2: true,
      ALTI: true,
      georeferenced: true,
      data: true,
      DPOI: true,
      view: true,
      acoustics: true,
      WBS: true,
      basicFeatures: true,
    },
    {
      country: 'Switzerland',
      region: 'Zürich',
      progress: 34,
      apartments: 302,
      delivered: true,
      structured: true,
      digitized: true,
      TLM: true,
      LOD1: true,
      LOD2: true,
      ALTI: true,
      georeferenced: true,
      data: true,
      DPOI: true,
      view: true,
      acoustics: true,
      WBS: true,
      basicFeatures: true,
    }
  ];

  constructor() { }

  ngOnInit() {
    this.gridOptions = <GridOptions>{
      rowData: this.rowData,
      columnDefs: this.columnDefs,
      onFilterChanged: (params) => {
          const model = params.api.getFilterModel();
          this.filterModelSet = (model !== null) || Object.keys(model).length > 0;
      },
      onGridReady: (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.gridOptions.api.sizeColumnsToFit();
      },
      // rowHeight: 48, recommended row height for material design data grids,
      frameworkComponents: {
        checkboxRenderer: MatCheckboxComponent,
        procentRenderer: ProcentRendererComponent
      },
      enableColResize: true,
      enableSorting: true,
      enableFilter: true,
      rowSelection: 'multiple'
    };
  }

  clearFilters() {
    this.filterModelSet = false;
    this.gridApi.setFilterModel(null);
    this.gridApi.onFilterChanged();
  }

}
