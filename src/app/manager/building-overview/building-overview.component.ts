import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { MatCheckboxComponent } from '../../_shared-components/mat-checkbox/mat-checkbox.component';
import { ProcentRendererComponent } from '../../_shared-components/procent-renderer/procent-renderer.component';
import swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { parseParms } from '../url';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-building-overview',
  templateUrl: './building-overview.component.html',
  styleUrls: ['./building-overview.component.scss'],
})
export class BuildingOverviewComponent implements OnInit, OnDestroy {
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
    { headerName: 'Site_id', field: 'site_id', editable: true },
    { headerName: 'Building_id', field: 'building_id', editable: true },

    { headerName: 'Name', field: 'name', editable: true },
    { headerName: 'Description', field: 'description', editable: true },
    { headerName: 'Images', field: 'images', cellRenderer: this.viewImg, editable: true },
    { headerName: 'Status', field: 'status', editable: true },

    {
      headerName: 'Country',
      field: 'address.country',
      filter: 'agSetColumnFilter',
      editable: true,
    },
    { headerName: 'City', field: 'address.city', filter: 'agSetColumnFilter', editable: true },
    { headerName: 'Street', field: 'address.street', editable: true },
    { headerName: 'Street_nr', field: 'address.street_nr', editable: true },
    { headerName: 'Postal_code', field: 'address.postal_code', editable: true },

    // { headerName: 'Building_reference', field: 'building_reference', editable: true },
    { headerName: 'Ref - Swiss topo', field: 'building_reference.swiss_topo', editable: true },
    {
      headerName: 'Ref - Open_street_maps',
      field: 'building_reference.open_street_maps',
      editable: true,
    },

    {
      headerName: 'Units',
      field: 'units',
      filter: 'agNumberColumnFilter',
      cellRenderer: this.viewUnits,
      editable: false,
    },

    { headerName: 'User_id', field: 'user_id', editable: true },
    { headerName: 'Created', field: 'created', cellRenderer: this.viewDate, editable: false },
    { headerName: 'Updated', field: 'updated', cellRenderer: this.viewDate, editable: false },
  ];

  rowData;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  viewUnits(params) {
    const number = params.value > 0 ? params.value : 0;
    return (
      number + `<a href='/manager/unit#building_id=` + params.data.building_id + `' > View </a>`
    );
  }

  viewDate(params) {
    if (params.value && params.value!==''){
      const readable = new Date(params.value);
      const m = readable.getMonth(); // returns 6
      const d = readable.getDay();  // returns 15
      const y = readable.getFullYear();  // returns 2012
      return `${d}.${m}.${y}`;
    }
    return ``;
  }

  viewImg(params) {
    if (params.value && params.value !== '') {
      return `<a href='` + params.value + `' > View ` + params.value + `</a>`;
    } else {
      return ``;
    }
  }

  ngOnInit() {
    /** BUILDINGS */

    this.http.get('http://api.archilyse.com/v1/buildings').subscribe(buildings => {
      console.log('buildings', buildings);

      this.gridOptions = <GridOptions>{
        rowData: <any[]>buildings, //this.rowData,
        columnDefs: this.columnDefs,

        onCellValueChanged: params => {
          console.log('onCellValueChanged', params);
          this.editRow(params.data);
        },

        onFilterChanged: params => {
          const model = params.api.getFilterModel();
          this.filterModelSet = model !== null && Object.keys(model).length > 0;
          console.log('model', model);
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
          }, console.error);
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

  addRow() {
    this.http
      .post('http://api.archilyse.com/v1/buildings', {
        address: {
          city: 'St. Gallen',
          country: 'Switzerland',
          postal_code: '9000',
          street: 'Ruhbergstrasse',
          street_nr: '44',
        },

        building_reference: {
          open_street_maps: '5a8fec5c4cdf4c000b04f8cf',
          swiss_topo: '5a8fec994cdf4c000a3b13b3',
        },

        description: "The best building ever built in the universe, cause Archilyse's there.",
        images: 'http://s3-bucket-url.com/image/123',
        name: 'My favorite building!',
        site_id: '5a8fec5c4cdf4c000b04f8cf',
      })
      .subscribe(building => {
        console.log('buildings', building);
        this.gridOptions.api.updateRowData({
          add: [building],
        });
        /**
        this.gridOptions.api.updateRowData({
          add: [
            {
              site_id: '',
              building_id: '',
              name: '',
              description: '',
              images: '',
              status: '',
              address: '',
              street: '',
              street_nr: '',
              postal_code: '',

              city: '',
              country: '',

              swiss_topo: '',
              open_street_maps: '',

              units: 0,

              user_id: '',
              created: '',
              updated: '',
            },
          ],
        });
         */
      }, console.error);
  }

  editRow(building) {
    this.http
      .patch('http://api.archilyse.com/v1/buildings/' + building.building_id, building)
      .subscribe(building => {
        console.log('EDIT building', building);
      }, console.error);
  }

  delete() {
    let titleVal;
    let textVal;
    let confirmButtonTextVal;

    if (this.selectedRows.length <= 1) {
      titleVal = `Delete this building?`;
      textVal = `This action cannot be undone. Are you sure you want to delete this building?`;
      confirmButtonTextVal = 'Yes, delete it';
    } else {
      titleVal = `Delete these ${this.selectedRows.length} buildings?`;
      textVal = `This action cannot be undone. Are you sure you want to delete these buildings?`;
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
          const building_id = 'Example building id';
          this.http
            .delete('http://api.archilyse.com/v1/buildings/' + building_id)
            .subscribe(buildings => {
              console.log('DELETE buildings', buildings, building_id);
            }, console.error);
        });

        this.gridOptions.api.updateRowData({
          remove: this.selectedRows,
        });
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
  }

  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }
}
