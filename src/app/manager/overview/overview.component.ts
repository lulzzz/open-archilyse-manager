import { Component, OnInit } from '@angular/core';

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

  columnDefs = [
    {headerName: 'Make', field: 'make', checkboxSelection: true, editable: true, onCellValueChanged: this.onCellValueChanged },
    {headerName: 'Model', field: 'model', editable: true, onCellValueChanged: this.onCellValueChanged },
    {headerName: 'Price', field: 'price', editable: true, onCellValueChanged: this.onCellValueChanged}
  ];

  rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxter', price: 72000 }
  ];

  constructor() { }

  ngOnInit() {
  }
  onCellValueChanged(event){
    console.log("onCellValueChanged",event.newValue,event.oldValue);
    console.log("ROW", event.data);
  }


}
