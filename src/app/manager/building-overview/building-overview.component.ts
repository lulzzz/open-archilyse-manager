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
    { headerName: 'Building_id', field: 'building_id', editable: true },
    { headerName: 'Site_id', field: 'site_id', editable: true },
    { headerName: 'Name', field: 'name', editable: true },
    { headerName: 'Description', field: 'description', editable: true },
    { headerName: 'Images', field: 'images', editable: true },
    { headerName: 'Status', field: 'status', editable: true },
    { headerName: 'Address', field: 'address', editable: true },
    { headerName: 'Street', field: 'street', editable: true },
    { headerName: 'Street_nr', field: 'street_nr', editable: true },
    { headerName: 'Postal_code', field: 'postal_code', editable: true },

    { headerName: 'City', field: 'city', filter: 'agSetColumnFilter', editable: true },
    { headerName: 'Country', field: 'country', filter: 'agSetColumnFilter', editable: true },

    // { headerName: 'Building_reference', field: 'building_reference', editable: true },
    { headerName: 'Ref - Swiss topo', field: 'swiss_topo', editable: true },
    { headerName: 'Ref - Open_street_maps', field: 'open_street_maps', editable: true },

    {
      headerName: 'Units',
      field: 'units',
      filter: 'agNumberColumnFilter',
      cellRenderer: this.viewUnits,
      editable: false,
    },

    { headerName: 'User_id', field: 'user_id', editable: true },
    { headerName: 'Created', field: 'created', editable: false },
    { headerName: 'Updated', field: 'updated', editable: false },
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
      units: '18',
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
      units: '5',
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
      units: '31',
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
      units: '29',
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
      units: '32',
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
      units: '30',
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
      units: '32',
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
      units: '30',
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
      units: '0',
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
      units: '0',
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
      units: '79',
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
      units: '4',
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
      units: '4',
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
      units: '4',
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
      units: '4',
    },
  ];

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  viewUnits(params) {
    return (
      params.value +
      `<a href='/manager/unit#building_id=` +
      params.data.building_id +
      `' > View </a>`
    );
  }

  ngOnInit() {
    /** BUILDINGS */

    this.http.get('http://api.archilyse.com/v1/buildings').subscribe(buildings => {
      console.log('buildings', buildings);

      this.gridOptions = <GridOptions>{
        rowData: this.rowData,
        columnDefs: this.columnDefs,

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
          city: 'Zurich',
          country: 'Switzerland',
          postal_code: '8005',
          street: 'Technopark',
          street_nr: '1',
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
      .subscribe(buildings => {
        console.log('buildings', buildings);

        this.gridOptions.api.updateRowData({
          add: [
            {
              site_id: '',
              object_id: '',
              building_id: '',
              country: '',
              street: '',
              number: '',
              zip: '',
              city: '',
              units: '0',
            },
          ],
        });
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
        const building_id = 'Example building id';
        this.http
          .delete('http://api.archilyse.com/v1/buildings/' + building_id)
          .subscribe(buildings => {
            console.log('DELETE buildings', buildings, building_id);

            this.gridOptions.api.updateRowData({
              remove: this.selectedRows,
            });

          }, console.error);


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
