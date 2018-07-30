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
  templateUrl: './unit-overview.component.html',
  styleUrls: ['./unit-overview.component.scss'],
})
export class UnitOverviewComponent implements OnInit, OnDestroy {
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
    { headerName: 'Unit_id', field: 'unit_id', editable: false },
    { headerName: 'User_id', field: 'user_id', editable: false },
    {
      headerName: 'Building_id',
      field: 'building_id',
      cellRenderer: this.viewBuilding,
      editable: false,
    },
    { headerName: 'Name', field: 'name', editable: true },
    { headerName: 'Description', field: 'description', editable: true },
    { headerName: 'Images', field: 'images', cellRenderer: this.viewImg, editable: false },
    { headerName: 'Address Line1', field: 'line1', editable: true },
    { headerName: 'Address Line2', field: 'line2', editable: true },
    { headerName: 'Address Line3', field: 'line3', editable: true },
    {
      headerName: 'Layouts',
      field: 'layouts',
      filter: 'agNumberColumnFilter',
      cellRenderer: this.viewLayouts,
      editable: false,
    },
    { headerName: 'Created', field: 'created', cellRenderer: this.viewDate, editable: false },
    { headerName: 'Updated', field: 'updated', cellRenderer: this.viewDate, editable: false },

    // Custom externals params
    { headerName: 'Remarks', field: 'remarks', editable: true },
  ];

  rowData;

  addRow() {
    this.http
      .post('http://api.archilyse.com/v1/units', {
        address: {
          line1: 'asdf321',
          line2: '2b',
          line3: 'adf32314',
        },
        building_id: '5a8fec5c4cdf4c000b04f8cf',
        created: '2018-07-27T12:34:21.875Z',
        description: 'Optimizing for most optimum mobility inside the space.',
        images: 'http://s3-bucket-url.com/image/123',
        name: 'My unit',
        updated: '2018-07-27T12:34:21.875Z',
      })
      .subscribe(units => {
        console.log('units', units);

        this.gridOptions.api.updateRowData({
          add: [units],
        });
      }, console.error);
  }

  editRow(unit) {
    this.http.patch('http://api.archilyse.com/v1/units/' + unit.unit_id, unit).subscribe(unit => {
      console.log('EDIT unit', unit);
    }, console.error);
  }

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  viewImg(params) {
    if (params.value && params.value !== '') {
      return `<a href='` + params.value + `' > View ` + params.value + `</a>`;
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

  viewBuilding(params) {
    return (
      params.value +
      `<a href='/manager/building#building_id=` +
      params.data.building_id +
      `' > View </a>`
    );
  }

  viewLayouts(params) {
    const number = params.value > 0 ? params.value : 0;
    return number + `<a href='/manager/layout#unit_id=` + params.data.unit_id + `' > View </a>`;
  }

  ngOnInit() {
    /** UNITS */

    this.http.get('http://api.archilyse.com/v1/units').subscribe(units => {
      console.log('units', units);

      this.gridOptions = <GridOptions>{
        rowData: <any[]>units, //this.rowData,
        columnDefs: this.columnDefs,

        onCellValueChanged: params => {
          console.log('onCellValueChanged', params);
          this.editRow(params.data);
        },

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
          // this.gridOptions.api.sizeColumnsToFit();

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

  delete() {
    let titleVal;
    let textVal;
    let confirmButtonTextVal;

    if (this.selectedRows.length <= 1) {
      titleVal = `Delete this unit?`;
      textVal = `This action cannot be undone. Are you sure you want to delete this unit?`;
      confirmButtonTextVal = 'Yes, delete it';
    } else {
      titleVal = `Delete these ${this.selectedRows.length} units?`;
      textVal = `This action cannot be undone. Are you sure you want to delete these units?`;
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
          const unit_id = selectedRow.unit_id;
          this.http.delete('http://api.archilyse.com/v1/units/' + unit_id).subscribe(units => {
            console.log('DELETE units', units, unit_id);
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
  }

  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }
}
