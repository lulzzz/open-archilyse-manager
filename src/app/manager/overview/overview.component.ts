import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { MatCheckboxComponent } from '../../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../../_shared-components/procent-renderer/procent-renderer.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { parseParms } from '../url';
import {ManagerFunctions} from '../managerFunctions';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
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
    {
      headerName: 'Object_ID',
      field: 'object_id',
      editable: true,
      onCellValueChanged: this.onCellValueChanged,
    },
    {
      headerName: 'Building_ID',
      field: 'building_id',
      editable: true,
      onCellValueChanged: this.onCellValueChanged,
    },
    {
      headerName: 'Level_ID',
      field: 'level_id',
      editable: true,
      onCellValueChanged: this.onCellValueChanged,
    },
    {
      headerName: 'Apartment_ID',
      field: 'apartment_id',
      editable: true,
      onCellValueChanged: this.onCellValueChanged,
    },
    {
      headerName: 'ID_Wohnung_Livit',
      field: 'id_wohnung',
      editable: true,
      onCellValueChanged: this.onCellValueChanged,
    },
    {
      headerName: 'Position',
      field: 'position',
      editable: true,
      onCellValueChanged: this.onCellValueChanged,
    },
    {
      headerName: 'Area (m²)',
      field: 'area',
      editable: true,
      onCellValueChanged: this.onCellValueChanged,
    },
    {
      headerName: 'Rooms',
      field: 'rooms',
      editable: true,
      onCellValueChanged: this.onCellValueChanged,
    },
    {
      headerName: 'InFloorplan',
      field: 'infloorplan',
      editable: true,
      cellRenderer: ManagerFunctions.cellPdfDownloadLink,
      onCellValueChanged: this.onCellValueChanged,
    },
    {
      headerName: 'CheckedPlan',
      field: 'checkedplan',
      cellRenderer: 'checkboxRenderer',
      editable: true,
      onCellValueChanged: this.onCellValueChanged,
    },
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
    },
  ];

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {

    ManagerFunctions.requestAllData(
      this.http,
      (sitesArray, buildingsArray, unitsArray, layoutsArray) => {
        console.log('DATA', sitesArray, buildingsArray, unitsArray, layoutsArray);

        this.gridOptions = <GridOptions>{
          rowData: this.rowData,
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
            this.gridOptions.api.sizeColumnsToFit();

            this.fragment_sub = ManagerFunctions.setDefaultFilters(this.route, this.columnDefs, this.gridApi);
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

      });

  }

  onCellValueChanged(event) {
    // console.log('onCellValueChanged',event.newValue,event.oldValue);
    // console.log('ROW', event.data);
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
