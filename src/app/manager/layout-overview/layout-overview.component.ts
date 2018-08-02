import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { MatCheckboxComponent } from '../../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../../_shared-components/procent-renderer/procent-renderer.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../managerFunctions';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

@Component({
  selector: 'app-floorplan-overview',
  templateUrl: './layout-overview.component.html',
  styleUrls: ['./layout-overview.component.scss'],
})
export class LayoutOverviewComponent implements OnInit, OnDestroy {
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
      headerName: 'Layout_id',
      field: 'layout_id',
      width: 190,
      editable: false,
    },
    {
      headerName: 'Unit_id',
      field: 'unit_id',
      width: 230,
      cellRenderer: this.viewUnit,
      editable: true,
    },
    { headerName: 'Name', field: 'name', editable: true },
    { headerName: 'Description', field: 'description', editable: true },
    {
      headerName: 'FloorPlan',
      field: 'floorPlan',
      cellRenderer: ManagerFunctions.cellPdfDownloadLink,
      editable: false,
    },
    {
      headerName: 'Images',
      field: 'images',
      cellRenderer: ManagerFunctions.viewImg,
      editable: true,
    },

    {
      headerName: 'Model_structure',
      field: 'model_structure',
      cellRenderer: this.viewModel,
      editable: true,
    },
    ...ManagerFunctions.metaUserAndData,
  ];

  addRow() {
    this.http
      .post('http://api.archilyse.com/v1/layouts', {
        name: '',
        description: '',
        images: '',
        movement: {
          angle: 0,
          source: 'swiss_topo',
          x_off: 0,
          x_pivot: 0,
          y_off: 0,
          y_pivot: 0,
          z_off: 0,
          z_pivot: 0,
        },
        site_id: '',
        unit_id: '',
        source: 'archilogic.com/scene/!675fe04b-4ee8-478a-a758-647f9f1e6f27?mode=3d',
      })
      .subscribe(layouts => {
        console.log('layouts', layouts);

        this.gridOptions.api.updateRowData({
          add: [layouts],
        });
      }, console.error);
  }

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  viewModel(params) {
    return `<a href='/editor/` + params.data.layout_id + `' > View model </a>`;
  }

  viewUnit(params) {
    if (params.value && params.value !== '' && params.value !== 'None') {
      return params.value + ` <a href='/manager/unit#unit_id=` + params.value + `' > View </a>`;
    }
    return ``;
  }

  ngOnInit() {
    /** LAYOUTS */

    this.http.get('http://api.archilyse.com/v1/layouts').subscribe(layouts => {
      console.log('layouts', layouts);

      this.gridOptions = <GridOptions>{
        rowData: <any[]>layouts, //this.rowData,
        columnDefs: this.columnDefs,

        onCellValueChanged: params => {
          ManagerFunctions.reactToEdit(this.http, params, 'layout_id', 'layouts');
        },

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

          // this.gridOptions.api.sizeColumnsToFit();

          this.fragment_sub = ManagerFunctions.setDefaultFilters(
            this.route,
            this.columnDefs,
            this.gridApi
          );
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
    }, console.error);
  }

  delete() {
    ManagerFunctions.reactToDelete(
      this.http,
      this.selectedRows,
      this.gridOptions.api,
      'layout',
      'layouts',
      'layout_id',
      'layouts'
    );
  }

  georeference() {
    const nodes = this.gridOptions.api.getSelectedNodes();

    if (nodes.length === 1) {
      const node = nodes[0];

      const layout_id = node.data.layout_id;
      const unit_id = node.data.unit_id;

      /**
       * We need to request the unit to link
       */
      this.http.get('http://api.archilyse.com/v1/units/' + unit_id).subscribe(unit => {
        if (unit) {
          const building_id = unit['building_id'];
          ManagerFunctions.openNewWindow('/georeference/building/' + building_id + '/' + layout_id);
        }
      });
    } else if (nodes.length > 1) {
      const layout_ids = nodes.map(node => node.data.layout_id);
      const getBuildingsIds = nodes.map(node =>
        this.http
          .get('http://api.archilyse.com/v1/units/' + node.data.unit_id) // node.data.unit_id
          .pipe(map(unit => unit['building_id']), catchError(error => of(null)))
      );

      Observable.forkJoin(getBuildingsIds).subscribe(buildings_id => {
        const lines = layout_ids.map((layoutId, i) => {
          const building_id = buildings_id[i];
          if (building_id && building_id !== null) {
            return [building_id, layoutId];
          }
        });
        const filteredList = lines.filter(value => value);
        if (filteredList.length === 1) {
          const building_id = filteredList[0][0];
          const layout_id = filteredList[0][1];
          ManagerFunctions.openNewWindow('/georeference/building/' + building_id + '/' + layout_id);
        } else if (filteredList.length > 1) {
          const filteredListJoined = filteredList.map(lines => lines.join(`\t`));
          const list = filteredListJoined.join('\n');
          ManagerFunctions.openNewWindow('/georeference?list=' + list);
        }
      });
    }
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
