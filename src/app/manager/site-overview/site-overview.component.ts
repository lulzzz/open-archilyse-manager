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
  selector: 'app-site-overview',
  templateUrl: './site-overview.component.html',
  styleUrls: ['./site-overview.component.scss'],
})
export class SiteOverviewComponent implements OnInit, OnDestroy {
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
    { headerName: 'Site_id', field: 'site_id', editable: false },
    { headerName: 'Name', field: 'name', editable: true },
    { headerName: 'Description', field: 'description', editable: true },
    {
      headerName: 'Buildings',
      field: 'buildings',
      filter: 'agNumberColumnFilter',
      cellRenderer: this.viewBuildings,
      editable: false,
    },

    // Custom externals params
    { headerName: 'Remarks', field: 'remarks', editable: true },
  ];

  rowData = [
    {
      site_id: 'Example Site Id 0',
      name: 'Example site 1',
      description: '',
      buildings: 10,
      remarks: '',
    },
    {
      site_id: 'Example Site Id 1',
      name: 'Example site 2',
      description: 'Example description',
      buildings: 5,
      remarks: '',
    },
    {
      site_id: 'Example Site Id 2',
      name: 'Example site 3',
      description: '',
      buildings: 0,
      remarks: '',
    },
  ];

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  viewBuildings(params) {
    const number = params.value > 0 ? params.value : 0;
    return number + `<a href='/manager/building#site_id=` + params.data.site_id + `' > View </a>`;
  }

  addRow() {
    this.http
      .post('http://api.archilyse.com/v1/sites', {
        description: '',
        name: '',
      })
      .subscribe(site => {
        this.gridOptions.api.updateRowData({
          add: [site],
        });
      }, console.error);
  }

  editRow(site) {
    this.http.patch('http://api.archilyse.com/v1/sites/' + site.site_id, site).subscribe(site => {
      console.log('EDIT site', site);
    }, console.error);
  }

  ngOnInit() {
    /** SITES */
    this.http.get('http://api.archilyse.com/v1/sites').subscribe(sites => {
      console.log('sites', sites);
      this.gridOptions = <GridOptions>{
        rowData: <any[]>sites, //this.rowData,
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

  delete() {
    let titleVal;
    let textVal;
    let confirmButtonTextVal;

    if (this.selectedRows.length <= 1) {
      titleVal = `Delete this site?`;
      textVal = `This action cannot be undone. Are you sure you want to delete this site?`;
      confirmButtonTextVal = 'Yes, delete it';
    } else {
      titleVal = `Delete these ${this.selectedRows.length} sites?`;
      textVal = `This action cannot be undone. Are you sure you want to delete these sites?`;
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
          const site_id = selectedRow.site_id;
          this.http.delete('http://api.archilyse.com/v1/sites/' + site_id).subscribe(sites => {
            console.log('DELETE sites', sites, site_id);
          }, console.error);
        });

        this.gridOptions.api.updateRowData({
          remove: this.selectedRows,
        });
      }
    });
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
