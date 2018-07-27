import { Component, OnInit } from '@angular/core';
import { AddRangeSelectionParams, GridOptions } from 'ag-grid';
import { MatCheckboxComponent } from '../../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../../_shared-components/procent-renderer/procent-renderer.component';
import swal from 'sweetalert2';

@Component({
  selector: 'app-building-overview',
  templateUrl: './building-overview.component.html',
  styleUrls: ['./building-overview.component.scss'],
})
export class BuildingOverviewComponent implements OnInit {
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
    { headerName: 'Site_Id', field: 'site_id', editable: false },
    { headerName: 'Object_ID', field: 'object_id', editable: false },
    { headerName: 'Building_ID', field: 'building_id', editable: false },
    { headerName: 'Street', field: 'street', editable: true },
    { headerName: 'Number', field: 'number', editable: true },
    { headerName: 'ZIP', field: 'zip', editable: true },
    { headerName: 'City', field: 'city', editable: true },
    { headerName: 'Country', field: 'country', editable: true },
    { headerName: 'Apartments', field: 'apartments', editable: false },
  ];

  rowData = [
    {
      site_id: 'Example Site Id 0',
      object_id: '2102440',
      building_id: '01',
      country: 'Switzerland',
      street: 'Gartenstrasse',
      number: '6',
      zip: '8002',
      city: 'Zürich',
      apartments: '18',
    },
    {
      site_id: 'Example Site Id 0',
      object_id: '2102440',
      building_id: '02',
      country: 'Switzerland',
      street: 'Stockerstrasse',
      number: '54',
      zip: '8002',
      city: 'Zürich',
      apartments: '5',
    },
    {
      site_id: 'Example Site Id 1',
      object_id: '2105090',
      building_id: '01',
      country: 'Switzerland',
      street: 'Turbinenstrasse',
      number: '31',
      zip: '8005',
      city: 'Zürich',
      apartments: '31',
    },
    {
      site_id: 'Example Site Id 1',
      object_id: '2105090',
      building_id: '02',
      country: 'Switzerland',
      street: 'Turbinenstrasse',
      number: '33',
      zip: '8005',
      city: 'Zürich',
      apartments: '29',
    },
    {
      site_id: 'Example Site Id 1',
      object_id: '2105090',
      building_id: '03',
      country: 'Switzerland',
      street: 'Turbinenstrasse',
      number: '35',
      zip: '8005',
      city: 'Zürich',
      apartments: '32',
    },
    {
      site_id: 'Example Site Id 1',
      object_id: '2105090',
      building_id: '04',
      country: 'Switzerland',
      street: 'Turbinenstrasse',
      number: '37',
      zip: '8005',
      city: 'Zürich',
      apartments: '30',
    },
    {
      site_id: 'Example Site Id 1',
      object_id: '2105090',
      building_id: '05',
      country: 'Switzerland',
      street: 'Turbinenstrasse',
      number: '39',
      zip: '8005',
      city: 'Zürich',
      apartments: '32',
    },
    {
      site_id: 'Example Site Id 2',
      object_id: '2105090',
      building_id: '06',
      country: 'Switzerland',
      street: 'Turbinenstrasse',
      number: '41',
      zip: '8005',
      city: 'Zürich',
      apartments: '30',
    },
    {
      site_id: 'Example Site Id 2',
      object_id: '2109010',
      building_id: '01',
      country: 'Switzerland',
      street: 'Badenerstrasse',
      number: '575',
      zip: '8048',
      city: 'Zürich',
      apartments: '0',
    },
    {
      site_id: 'Example Site Id 2',
      object_id: '2109010',
      building_id: '02',
      country: 'Switzerland',
      street: 'Badenerstrasse',
      number: '581',
      zip: '8048',
      city: 'Zürich',
      apartments: '0',
    },
    {
      site_id: 'Example Site Id 2',
      object_id: '2111060',
      building_id: '01',
      country: 'Switzerland',
      street: 'Leutschenbachstrasse',
      number: '50',
      zip: '8050',
      city: 'Zürich',
      apartments: '79',
    },
    {
      site_id: 'Example Site Id 2',
      object_id: '2111060',
      building_id: '',
      country: 'Switzerland',
      street: 'Leutschenbachstrasse',
      number: '52',
      zip: '8050',
      city: 'Zürich',
      apartments: '4',
    },
    {
      site_id: 'Example Site Id 2',
      object_id: '2111060',
      building_id: '',
      country: 'Switzerland',
      street: 'Leutschenbachstrasse',
      number: '54',
      zip: '8050',
      city: 'Zürich',
      apartments: '4',
    },
    {
      site_id: 'Example Site Id 2',
      object_id: '2111060',
      building_id: '',
      country: 'Switzerland',
      street: 'Leutschenbachstrasse',
      number: '56',
      zip: '8050',
      city: 'Zürich',
      apartments: '4',
    },
    {
      site_id: 'Example Site Id 2',
      object_id: '2111060',
      building_id: '',
      country: 'Switzerland',
      street: 'Leutschenbachstrasse',
      number: '58',
      zip: '8050',
      city: 'Zürich',
      apartments: '4',
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

  clearSelection() {
    const nodes = this.gridOptions.api.getSelectedNodes();
    nodes.forEach(node => node.setSelected(false));
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

  delete() {
    let title;
    let text;
    let confirmButtonText;

    if (this.selectedRows.length <= 1) {
      title = `Delete this building?`;
      text = `This action cannot be undone. Are you sure you want to delete this building?`;
      confirmButtonText = 'Yes, delete it';
    } else {
      title = `Delete these ${this.selectedRows.length} buildings?`;
      text = `This action cannot be undone. Are you sure you want to delete these buildings?`;
      confirmButtonText = 'Yes, delete them';
    }

    swal({
      title: title,
      text: text,
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      customClass: 'arch',
    }).then(result => {
      if (result.value) {
        alert('Buildings deleted!');
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

  clearFilters() {
    this.filterModelSet = false;
    this.gridApi.setFilterModel(null);
    this.gridApi.onFilterChanged();
  }
}
