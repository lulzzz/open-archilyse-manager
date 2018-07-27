import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { MatCheckboxComponent } from '../../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../../_shared-components/procent-renderer/procent-renderer.component';

@Component({
  selector: 'app-floorplan-overview',
  templateUrl: './unit-overview.component.html',
  styleUrls: ['./unit-overview.component.scss'],
})
export class UnitOverviewComponent implements OnInit {
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
    { headerName: 'Building_Id', field: 'building_id', editable: false },
    { headerName: 'Raumhöhe', field: 'raumhoehe', filter: 'agNumberColumnFilter', editable: true },
    { headerName: 'Remarks', field: 'remarks', editable: true },
  ];

  rowData = [
    {
      building_id: 'Example Building Id 0',
      floorPlan: '2102440-01-00.pdf',
      modelStructureId: 'dfb8e436-6bfa-429b-9cd1-6a06727ef711',
      bruestungshoehe: 1.0,
      fensterhoehe: 1.2,
      raumhoehe: 3.04,
      remarks: '',
    },
    {
      building_id: 'Example Building Id 0',
      floorPlan: '2102440-01-01.pdf',
      modelStructureId: 'dfb8e436-6bfa-429b-9cd1-6a06727ef711',
      bruestungshoehe: 1.0,
      fensterhoehe: 1.12,
      raumhoehe: 3.04,
      remarks: ' This layout is not good, somebody drunk created it while he was food poisoned',
    },
    {
      building_id: 'Example Building Id 0',
      floorPlan: '2102440-01-02.pdf',
      modelStructureId: 'dfb8e436-6bfa-429b-9cd1-6a06727ef711',
      bruestungshoehe: 1.0,
      fensterhoehe: 1.2,
      raumhoehe: 3.02,
      remarks: '',
    },
    {
      building_id: 'Example Building Id 0',
      floorPlan: '2102440-01-03.pdf',
      modelStructureId: 'dfb8e436-6bfa-429b-9cd1-6a06727ef711',
      bruestungshoehe: 1.0,
      fensterhoehe: 1.2,
      raumhoehe: 2.04,
      remarks: '',
    },
    {
      building_id: 'Example Building Id 1',
      floorPlan: '2102440-01-04.pdf',
      modelStructureId: 'dfb8e436-6bfa-429b-9cd1-6a06727ef711',
      bruestungshoehe: 1.0,
      fensterhoehe: 1.2,
      raumhoehe: 3.04,
      remarks: '',
    },
    {
      building_id: 'Example Building Id 1',
      floorPlan: '2102440-02-00.pdf',
      modelStructureId: 'dfb8e436-6bfa-429b-9cd1-6a06727ef711',
      bruestungshoehe: 1.0,
      fensterhoehe: 1.2,
      raumhoehe: 3.04,
      remarks: '',
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

  cellPdfDownloadLink(params) {
    return (
      `<a href='/assets/pdf/example.pdf' download=` + params.value + `'>` + params.value + `</a>`
    );
  }

  cellEditorLink(params) {
    return `<a href='https://workplace.archilyse.com/editor' >` + params.value + `</a>`;
  }

  delete() {
    alert('Layouts deleted!');
  }

  georeference() {
    const buildingId = 'the_feature_id_also_building_id';
    const modelId = '5b3f3cb4adcbc100097a6b36';

    window.open(
      encodeURI(
        'https://workplace.archilyse.com/georeference/building/' + buildingId + '/' + modelId
      ),
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
