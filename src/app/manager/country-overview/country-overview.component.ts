import { Component, OnInit } from '@angular/core';
import {RegionOverviewComponent} from '../region-overview/region-overview.component';
import {GridOptions} from 'ag-grid';
import {MatCheckboxComponent} from '../../_shared-components/mat-checkbox/mat-checkbox.component';


@Component({
  selector: 'app-country-overview',
  templateUrl: './country-overview.component.html',
  styleUrls: ['./country-overview.component.scss']
})
export class CountryOverviewComponent implements OnInit {

  /**
   * TABLE DOCUMENTATION
   * https://www.ag-grid.com/angular-getting-started/
   */

  gridOptions;

  columnDefs = [
    {headerName: 'Country', field: 'country',  editable: false},
    {headerName: 'Apartments', field: 'apartments',  editable: false},
    {headerName: 'Delivered', field: 'delivered', cellRenderer: "checkboxRenderer", editable: false},
    {headerName: 'Structured', field: 'structured', cellRenderer: "checkboxRenderer", editable: false},
    {headerName: 'Digitized', field: 'digitized', cellRenderer: "checkboxRenderer", editable: false},
    {headerName: 'TLM-OBJ', field: 'TLM', cellRenderer: "checkboxRenderer", editable: false},
    {headerName: 'LOD1-OBJ', field: 'LOD1', cellRenderer: "checkboxRenderer", editable: false},
    {headerName: 'LOD2-OBJ', field: 'LOD2', cellRenderer: "checkboxRenderer", editable: false},
    {headerName: 'ALTI-OBJ', field: 'ALTI', cellRenderer: "checkboxRenderer", editable: false},
    {headerName: 'Georeferenced', field: 'georeferenced', cellRenderer: "checkboxRenderer", editable: false},
    {headerName: 'Data Complete', field: 'data', cellRenderer: "checkboxRenderer", editable: false},
    {headerName: 'DPOI', field: 'DPOI', cellRenderer: "checkboxRenderer", editable: false},
    {headerName: 'View & Sun', field: 'view', cellRenderer: "checkboxRenderer", editable: false},
    {headerName: 'Acoustics', field: 'acoustics', cellRenderer: "checkboxRenderer", editable: false},
    {headerName: 'WBS', field: 'WBS', cellRenderer: "checkboxRenderer", editable: false},
    {headerName: 'BasicFeatures', field: 'basicFeatures', cellRenderer: "checkboxRenderer", editable: false},
  ];

  rowData = [
    {
      country: "Switzerland",
      apartments: 2400,
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
      country: "Spain",
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
      country: "France",
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
      country: "England",
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
      country: "Germany",
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
      onGridReady: () => {
        this.gridOptions.api.sizeColumnsToFit();
      },
      // rowHeight: 48, recommended row height for material design data grids,
      frameworkComponents: {
        checkboxRenderer: MatCheckboxComponent,
      },
      enableSorting: true,
      enableFilter: true,
      rowSelection:"multiple"
    };
  }

}
