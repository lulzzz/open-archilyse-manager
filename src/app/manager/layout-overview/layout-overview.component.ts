import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { MatCheckboxComponent } from '../../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../../_shared-components/procent-renderer/procent-renderer.component';
import swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { parseParms } from '../url';
import { HttpClient } from '@angular/common/http';

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
      editable: false,
    },
    {
      headerName: 'Unit_id',
      field: 'unit_id',
      cellRenderer: this.viewUnit,
      editable: true,
    },
    { headerName: 'Name', field: 'name', editable: true },
    { headerName: 'Description', field: 'description', editable: true },
    {
      headerName: 'FloorPlan',
      field: 'floorPlan',
      cellRenderer: this.cellPdfDownloadLink,
      editable: false,
    },
    { headerName: 'Images', field: 'images', cellRenderer: this.viewImg, editable: true },

    {
      headerName: 'Model_structure',
      field: 'model_structure',
      cellRenderer: this.viewModel,
      editable: true,
    },
    { headerName: 'Created', field: 'created', cellRenderer: this.viewDate, editable: true },
    { headerName: 'Updated', field: 'updated', cellRenderer: this.viewDate, editable: true },

    // Custom externals params
    { headerName: 'Remarks', field: 'remarks', editable: true },
  ];

  rowData;

  addRow() {
    this.http
      .post('http://api.archilyse.com/v1/layouts', {
        description: 'Layout 2 related to swiss topo',
        images: 'http://s3-bucket-url.com/image/123',
        movement: {
          angle: 180.2,
          source: 'swiss_topo',
          x_off: 21231.8,
          x_pivot: 5.2,
          y_off: 12356.6,
          y_pivot: 52.1,
          z_off: 212.5,
          z_pivot: 24.2,
        },
        name: 'My favorite Layout!',
        site_id: '5a8fec5c4cdf4c123b04f8cf',
        source: 'archilogic.com/scene/!675fe04b-4ee8-478a-a758-647f9f1e6f27?mode=3d',
      })
      .subscribe(layouts => {
        console.log('layouts', layouts);

        this.gridOptions.api.updateRowData({
          add: [layouts],
        });
      }, console.error);
  }

  editRow(layout) {
    this.http
      .patch('http://api.archilyse.com/v1/layouts/' + layout.layout_id, layout)
      .subscribe(layout => {
        console.log('EDIT layout', layout);
      }, console.error);
  }

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  viewImg(params) {
    if (params.value && params.value !== '') {
      return `<a href='` + params.value + `' > View</a>`;
    } else {
      return ``;
    }
  }

  viewDate(params) {
    if (params.value && params.value !== '') {
      const readable = new Date(params.value);
      const m = readable.getMonth(); // returns 6
      const d = readable.getDay(); // returns 15
      const y = readable.getFullYear(); // returns 2012
      return `${d}.${m}.${y}`;
    }
    return ``;
  }

  viewModel(params) {
    return `<a href='/editor/` + params.data.layout_id + `' > View model </a>`;
  }

  viewUnit(params) {
    if (params.value && params.value !== '' && params.value !== 'None') {
      return `<a href='/manager/unit#unit_id=` + params.value + `' >` + params.value + ` </a>`;
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
          console.log('onCellValueChanged', params);
          this.editRow(params.data);
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
          this.gridOptions.api.sizeColumnsToFit();

          this.fragment_sub = this.route.fragment.subscribe(fragment => {
            const urlParams = parseParms(fragment);

            const model = {};
            Object.keys(urlParams).forEach(key => {
              const found = this.columnDefs.find(columnDef => columnDef.field === key);
              if (found) {
                model[key] = {
                  filter: urlParams[key],
                  filterType: 'text',
                  type: 'equals',
                };
              }
            });
            this.gridApi.setFilterModel(model);
          });
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

  cellPdfDownloadLink(params) {
    if (params && params.value && params.value !== '') {
      return (
        `<a href='/assets/pdf/example.pdf' download=` + params.value + `'>` + params.value + `</a>`
      );
    }
    return '';
  }

  delete() {
    let titleVal;
    let textVal;
    let confirmButtonTextVal;

    if (this.selectedRows.length <= 1) {
      titleVal = `Delete this layout?`;
      textVal = `This action cannot be undone. Are you sure you want to delete this layout?`;
      confirmButtonTextVal = 'Yes, delete it';
    } else {
      titleVal = `Delete these ${this.selectedRows.length} layouts?`;
      textVal = `This action cannot be undone. Are you sure you want to delete these layouts?`;
      confirmButtonTextVal = 'Yes, delete them';
    }

    swal({
      title: titleVal,
      text: textVal,
      showCancelButton: true,
      confirmButtonText: confirmButtonTextVal,
      customClass: 'arch',
    }).then(result => {
      if (result.value) {
        this.selectedRows.forEach(selectedRow => {
          console.log('selectedRow', selectedRow);
          const layout_id = selectedRow.layout_id;
          this.http
            .delete('http://api.archilyse.com/v1/layouts/' + layout_id)
            .subscribe(layouts => {
              console.log('DELETE layouts', layouts, layout_id);
            }, console.error);
        });

        this.gridOptions.api.updateRowData({
          remove: this.selectedRows,
        });
      }
    });
  }

  georeference() {
    const buildingId = 'the_feature_id_also_building_id';
    const modelId = '5b3f3cb4adcbc100097a6b36';

    window.open(encodeURI('/georeference/building/' + buildingId + '/' + modelId), '_blank');
  }

  clearSelection() {
    const nodes = this.gridOptions.api.getSelectedNodes();
    nodes.forEach(node => node.setSelected(false));
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
