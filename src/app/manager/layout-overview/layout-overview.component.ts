import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { MatCheckboxComponent } from '../../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../../_shared-components/procent-renderer/procent-renderer.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../managerFunctions';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { Layout, Unit } from '../../_models';
import {ApiFunctions} from '../apiFunctions';
import {urlGeoreference, urlPortfolio} from '../url';

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

  columnDefs;

  buildColumDefinitions(layouts, units) {
    this.columnDefs = [
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
        cellEditor: 'agPopupSelectCellEditor',
        cellEditorParams: {
          values: units.map(unit => unit.unit_id),
        },
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
        headerName: 'Movements',
        field: 'movements',
        cellRenderer: this.viewMovement,
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
  }

  addRow() {
    ApiFunctions.post(this.http,'layouts', {
        name: '',
        description: '',
        images: '',
        movements: [],
        source: 'archilogic.com/scene/!675fe04b-4ee8-478a-a758-647f9f1e6f27?mode=3d',
      }, layouts => {
        console.log('layouts', layouts);

        this.gridOptions.api.updateRowData({
          add: [layouts],
        });
      });
  }

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  viewMovement(params) {
    let result = '';
    if (params.movements) {
      for (let i = 0; i < params.movements.length; i += 1) {
        const movements = params.movements[i];
        result += `<div>
            source: ${movements.source},
            angle: ${movements.angle}°,
            offset (xyz): ${movements.x_off}, ${movements.y_off}, ${movements.z_off}
            pivot (xyz): ${movements.x_pivot}, ${movements.y_pivot}, ${movements.z_pivot}
          </div>`;
      }
    }
    return result;
  }

  viewModel(params) {
    return `<a href='/editor/` + params.data.layout_id + `' > View model </a>`;
  }

  viewUnit(params) {
    if (params.value && params.value !== '' && params.value !== 'None') {
      return params.value + ` <a href='${urlPortfolio}/unit#unit_id=` + params.value + `' > View </a>`;
    }
    return ``;
  }

  ngOnInit() {
    /** LAYOUTS */

    ApiFunctions.get(this.http,'layouts',layouts => {
      const layoutsArray = <Layout[]>layouts;

      ApiFunctions.get(this.http,'units',units => {
        const unitsArray = <Unit[]>units;

        this.buildColumDefinitions(layouts, units);

        this.gridOptions = <GridOptions>{
          rowData: layoutsArray,
          columnDefs: this.columnDefs,

          /** Pagination */
          ...ManagerFunctions.pagination,
          ...ManagerFunctions.columnOptions,

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
        };
      });
    });
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

  selectNotGeoreferenced() {
    this.gridOptions.api.selectAll();
    const nodes = this.gridOptions.api.getSelectedNodes();
    nodes.forEach(node => {
      if (ManagerFunctions.isReferencedLayout(node.data)) {
        node.setSelected(false);
      }
    });
  }

  georeference() {
    const nodes = this.gridOptions.api.getSelectedNodes();

    if (nodes.length === 1) {
      const node = nodes[0];

      const layout_id = node.data.layout_id;
      ManagerFunctions.openNewWindow( urlGeoreference + '/building/' + layout_id);
    } else if (nodes.length > 1) {
      const layout_ids = nodes.map(node => node.data.layout_id);

      const list = layout_ids.map(layout_id => `\t` + layout_id.join + `\n`);
      ManagerFunctions.openNewWindow(urlGeoreference + '/multiple#list=' + list);
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
