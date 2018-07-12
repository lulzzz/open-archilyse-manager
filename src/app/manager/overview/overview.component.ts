import { Component, OnInit } from '@angular/core';
import {GridOptions} from 'ag-grid';
import {MatCheckboxComponent} from '../../_shared-components/mat-checkbox/mat-checkbox.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  /**
   * TABLE DOCUMENTATION
   * https://www.ag-grid.com/angular-getting-started/
   */

  gridOptions;

  columnDefs = [
    {headerName: 'Object_ID', field: 'object_id',  editable: true, onCellValueChanged: this.onCellValueChanged},
    {headerName: 'Building_ID', field: 'building_id',  editable: true, onCellValueChanged: this.onCellValueChanged},
    {headerName: 'Level_ID', field: 'level_id',  editable: true, onCellValueChanged: this.onCellValueChanged},
    {headerName: 'Apartment_ID', field: 'apartment_id',  editable: true, onCellValueChanged: this.onCellValueChanged},
    {headerName: 'ID_Wohnung_Livit', field: 'id_wohnung', editable: true, onCellValueChanged: this.onCellValueChanged},
    {headerName: 'Position', field: 'position',  editable: true, onCellValueChanged: this.onCellValueChanged},
    {headerName: 'Area (m²)', field: 'area',  editable: true, onCellValueChanged: this.onCellValueChanged},
    {headerName: 'Rooms', field: 'rooms',  editable: true, onCellValueChanged: this.onCellValueChanged},
    {headerName: 'InFloorplan', field: 'infloorplan',  editable: true, onCellValueChanged: this.onCellValueChanged},
    {headerName: 'CheckedPlan', field: 'checkedplan',
      cellRenderer: "checkboxRenderer",
      editable: true, onCellValueChanged: this.onCellValueChanged}
  ];

  rowData = [
    {
      object_id: '2109010',
      building_id: '01',
      level_id: '02',
      apartment_id: '21',
      id_wohnung: '5088.01.0021',
      position: 'left',
      area: 90,
      rooms: 3.5,
      infloorplan: '2109010-01_02-02.pdf',
      checkedplan: true,
    },
    {
      object_id: '2109010',
      building_id: '01',
      level_id: '03',
      apartment_id: '31',
      id_wohnung: '5088.01.0031',
      position: 'left',
      area: 90,
      rooms: 3.5,
      infloorplan: '2109010-01_02-03.pdf',
      checkedplan: false,
    },
    {
      object_id: '2109010',
      building_id: '01',
      level_id: '03',
      apartment_id: '36',
      id_wohnung: '5088.01.0036',
      position: 'right',
      area: 75,
      rooms: 2.5,
      infloorplan: '2109010-01_02-03.pdf',
      checkedplan: true,
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
      enableColResize: true,
      enableSorting: true,
      enableFilter: true,
      rowSelection:"multiple"
    };
  }
  onCellValueChanged(event){
    // console.log("onCellValueChanged",event.newValue,event.oldValue);
    // console.log("ROW", event.data);
  }


}
