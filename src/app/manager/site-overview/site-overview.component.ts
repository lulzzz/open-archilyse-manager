import { Component, OnInit } from '@angular/core';
import { AddRangeSelectionParams, GridOptions } from 'ag-grid';
import { MatCheckboxComponent } from '../../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../../_shared-components/procent-renderer/procent-renderer.component';

@Component({
  selector: 'app-site-overview',
  templateUrl: './site-overview.component.html',
  styleUrls: ['./site-overview.component.scss'],
})
export class SiteOverviewComponent implements OnInit {
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

  columnDefs = [
    { headerName: 'Object_ID', field: 'object_id', editable: false },
    { headerName: 'Building_ID', field: 'building_id', editable: false },
    { headerName: 'Street', field: 'street', editable: false },
    { headerName: 'Number', field: 'number', editable: false },
    { headerName: 'ZIP', field: 'zip', editable: false },
    { headerName: 'City', field: 'city', editable: false },
    { headerName: 'Buildings', field: 'buildings', editable: false },
  ];

  rowData = [
    {
      object_id: '2102440',
      building_id: '01',
      street: 'Gartenstrasse',
      number: '6',
      zip: '8002',
      city: 'Zürich',
      buildings: '18',
    },
    {
      object_id: '2102440',
      building_id: '02',
      street: 'Stockerstrasse',
      number: '54',
      zip: '8002',
      city: 'Zürich',
      buildings: '5',
    },
    {
      object_id: '2105090',
      building_id: '01',
      street: 'Turbinenstrasse',
      number: '31',
      zip: '8005',
      city: 'Zürich',
      buildings: '31',
    },
    {
      object_id: '2105090',
      building_id: '02',
      street: 'Turbinenstrasse',
      number: '33',
      zip: '8005',
      city: 'Zürich',
      buildings: '29',
    },
    {
      object_id: '2105090',
      building_id: '03',
      street: 'Turbinenstrasse',
      number: '35',
      zip: '8005',
      city: 'Zürich',
      buildings: '32',
    },
    {
      object_id: '2105090',
      building_id: '04',
      street: 'Turbinenstrasse',
      number: '37',
      zip: '8005',
      city: 'Zürich',
      buildings: '30',
    },
    {
      object_id: '2105090',
      building_id: '05',
      street: 'Turbinenstrasse',
      number: '39',
      zip: '8005',
      city: 'Zürich',
      buildings: '32',
    },
    {
      object_id: '2105090',
      building_id: '06',
      street: 'Turbinenstrasse',
      number: '41',
      zip: '8005',
      city: 'Zürich',
      buildings: '30',
    },
    {
      object_id: '2109010',
      building_id: '01',
      street: 'Badenerstrasse',
      number: '575',
      zip: '8048',
      city: 'Zürich',
      buildings: '0',
    },
    {
      object_id: '2109010',
      building_id: '02',
      street: 'Badenerstrasse',
      number: '581',
      zip: '8048',
      city: 'Zürich',
      buildings: '0',
    },
    {
      object_id: '2111060',
      building_id: '01',
      street: 'Leutschenbachstrasse',
      number: '50',
      zip: '8050',
      city: 'Zürich',
      buildings: '79',
    },
    {
      object_id: '2111060',
      building_id: '',
      street: 'Leutschenbachstrasse',
      number: '52',
      zip: '8050',
      city: 'Zürich',
      buildings: '4',
    },
    {
      object_id: '2111060',
      building_id: '',
      street: 'Leutschenbachstrasse',
      number: '54',
      zip: '8050',
      city: 'Zürich',
      buildings: '4',
    },
    {
      object_id: '2111060',
      building_id: '',
      street: 'Leutschenbachstrasse',
      number: '56',
      zip: '8050',
      city: 'Zürich',
      buildings: '4',
    },
    {
      object_id: '2111060',
      building_id: '',
      street: 'Leutschenbachstrasse',
      number: '58',
      zip: '8050',
      city: 'Zürich',
      buildings: '4',
    },
  ];

  constructor() {}

  ngOnInit() {
    this.gridOptions = <GridOptions>{
      rowData: this.rowData,
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
        this.gridOptions.api.sizeColumnsToFit();
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

  selectNotGeoreferenced() {
    this.gridOptions.api.selectAll();
    const nodes = this.gridOptions.api.getSelectedNodes();
    nodes.forEach(node => {
      if (node.data.building_id !== '') {
        node.setSelected(false);
      }
    });
  }

  georeference() {
    const address = 'Example Address';
    const modelId = '5b3f3cb4adcbc100097a6b36';

    window.open(
      encodeURI('https://workplace.archilyse.com/georeference/map/' + address + '/' + modelId),
      '_blank'
    );
  }

  clearSelection() {
    const nodes = this.gridOptions.api.getSelectedNodes();
    nodes.forEach(node => node.setSelected(false));
  }

  clearFilters() {
    this.filterModelSet = false;
    this.gridApi.setFilterModel(null);
    this.gridApi.onFilterChanged();
  }
}
