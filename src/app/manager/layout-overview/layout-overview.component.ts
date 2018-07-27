import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { MatCheckboxComponent } from '../../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../../_shared-components/procent-renderer/procent-renderer.component';

@Component({
  selector: 'app-floorplan-overview',
  templateUrl: './layout-overview.component.html',
  styleUrls: ['./layout-overview.component.scss'],
})
export class LayoutOverviewComponent implements OnInit {
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
    {
      headerName: 'Unit_Id',
      field: 'unit_id',
      editable: false,
    },
    {
      headerName: 'FloorPlan',
      field: 'floorPlan',
      cellRenderer: this.cellPdfDownloadLink,
      editable: false,
    },
    {
      headerName: 'ModelStructure_ID',
      field: 'modelStructureId',
      cellRenderer: this.cellEditorLink,
      editable: false,
    },
    {
      headerName: 'Brüstungshöhe',
      field: 'bruestungshoehe',
      filter: 'agNumberColumnFilter',
      editable: true,
    },
    {
      headerName: 'Fensterhöhe',
      field: 'fensterhoehe',
      filter: 'agNumberColumnFilter',
      editable: true,
    },
    { headerName: 'Raumhöhe', field: 'raumhoehe', filter: 'agNumberColumnFilter', editable: true },
    { headerName: 'Remarks', field: 'remarks', editable: true },
  ];

  rowData = [
    {
      unit_id: 'Example Id 1',
      floorPlan: '2102440-01-00.pdf',
      modelStructureId: 'dfb8e436-6bfa-429b-9cd1-6a06727ef711',
      bruestungshoehe: 1.0,
      fensterhoehe: 1.2,
      raumhoehe: 3.04,
      remarks: '',
    },
    {
      unit_id: 'Example Id 2',
      floorPlan: '2102440-01-01.pdf',
      modelStructureId: 'dfb8e436-6bfa-429b-9cd1-6a06727ef711',
      bruestungshoehe: 1.0,
      fensterhoehe: 1.12,
      raumhoehe: 3.04,
      remarks: ' This layout is not good, somebody drunk created it while he was food poisoned',
    },
    {
      unit_id: 'Example Id 3',
      floorPlan: '2102440-01-02.pdf',
      modelStructureId: 'dfb8e436-6bfa-429b-9cd1-6a06727ef711',
      bruestungshoehe: 1.0,
      fensterhoehe: 1.2,
      raumhoehe: 3.02,
      remarks: '',
    },
    {
      unit_id: 'Example Id 4',
      floorPlan: '2102440-01-03.pdf',
      modelStructureId: 'dfb8e436-6bfa-429b-9cd1-6a06727ef711',
      bruestungshoehe: 1.0,
      fensterhoehe: 1.2,
      raumhoehe: 2.04,
      remarks: '',
    },
    {
      unit_id: 'Example Id 5',
      floorPlan: '2102440-01-04.pdf',
      modelStructureId: 'dfb8e436-6bfa-429b-9cd1-6a06727ef711',
      bruestungshoehe: 1.0,
      fensterhoehe: 1.2,
      raumhoehe: 3.04,
      remarks: '',
    },
    {
      unit_id: 'Example Id 6',
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
