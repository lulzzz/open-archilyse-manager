import { Component, OnInit } from '@angular/core';
import {GridOptions} from 'ag-grid';
import {MatCheckboxComponent} from '../../_shared-components/mat-checkbox/mat-checkbox.component';

@Component({
  selector: 'app-floorplan-overview',
  templateUrl: './floorplan-overview.component.html',
  styleUrls: ['./floorplan-overview.component.scss']
})
export class FloorplanOverviewComponent implements OnInit {

  /**
   * TABLE DOCUMENTATION
   * https://www.ag-grid.com/angular-getting-started/
   */

  gridOptions;

  columnDefs = [
    {headerName: 'FloorPlan', field: 'floorPlan',  editable: false},
    {headerName: 'ModelStructure_ID', field: 'modelStructureId',  editable: false},
    {headerName: 'Brüstungshöhe', field: 'bruestungshoehe', editable: true},
    {headerName: 'Fensterhöhe', field: 'fensterhoehe', editable: true},
    {headerName: 'Raumhöhe', field: 'raumhoehe', editable: true},
    {headerName: 'Remarks', field: 'remarks', editable: true},
  ];

  rowData = [
    {
      floorPlan: '2102440-01-00.pdf',
      modelStructureId: 'dfb8e436-6bfa-429b-9cd1-6a06727ef711',
      bruestungshoehe: 1.00,
      fensterhoehe: 1.20,
      raumhoehe: 3.04,
      remarks: ''
    }, {
      floorPlan: '2102440-01-01.pdf',
      modelStructureId: 'dfb8e436-6bfa-429b-9cd1-6a06727ef711',
      bruestungshoehe: 1.00,
      fensterhoehe: 1.20,
      raumhoehe: 3.04,
      remarks: ' This layout is not good, somebody drunk created it while he was food poisoned'
    }, {
      floorPlan: '2102440-01-02.pdf',
      modelStructureId: 'dfb8e436-6bfa-429b-9cd1-6a06727ef711',
      bruestungshoehe: 1.00,
      fensterhoehe: 1.20,
      raumhoehe: 3.04,
      remarks: ''
    }, {
      floorPlan: '2102440-01-03.pdf',
      modelStructureId: 'dfb8e436-6bfa-429b-9cd1-6a06727ef711',
      bruestungshoehe: 1.00,
      fensterhoehe: 1.20,
      raumhoehe: 3.04,
      remarks: ''
    }, {
      floorPlan: '2102440-01-04.pdf',
      modelStructureId: 'dfb8e436-6bfa-429b-9cd1-6a06727ef711',
      bruestungshoehe: 1.00,
      fensterhoehe: 1.20,
      raumhoehe: 3.04,
      remarks: ''
    }, {
      floorPlan: '2102440-02-00.pdf',
      modelStructureId: 'dfb8e436-6bfa-429b-9cd1-6a06727ef711',
      bruestungshoehe: 1.00,
      fensterhoehe: 1.20,
      raumhoehe: 3.04,
      remarks: ''
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
