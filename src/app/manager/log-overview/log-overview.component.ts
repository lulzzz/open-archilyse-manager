import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { LogService } from '../../_services';
import { ColumnDefinitions } from '../columnDefinitions';
import { ManagerFunctions } from '../managerFunctions';
import { CellRender } from '../cellRender';
import { apiUrl } from '../url';

@Component({
  selector: 'app-log-overview',
  templateUrl: './log-overview.component.html',
  styleUrls: ['./log-overview.component.scss'],
})
export class LogOverviewComponent implements OnInit, OnDestroy {
  generalError = null;
  loading = true;

  selectedNodes = [];
  selectedRows = [];

  gridApi;
  gridColumnApi;

  filterModelSet = false;

  gridOptions;
  fragment_sub;

  columnDefs = [
    {
      headerName: 'RApi Request Log',
      children: [
        {
          headerName: 'Time',
          field: 'time',
          width: 210,
          editable: false,
          cellRenderer: this.renderTime,
          cellClass: 'readOnly',
        },
        {
          headerName: 'URL',
          field: 'url',
          width: 210,
          editable: false,
          cellRenderer: this.renderUrl,
          cellClass: 'readOnly',
        },
        {
          headerName: 'Method',
          width: 90,
          editable: false,
          cellRenderer: this.renderRequestMethod,
          cellClass: 'readOnly',
        },
        {
          headerName: 'Request',
          field: 'request',
          width: 290,
          editable: false,
          cellRenderer: this.renderRequest,
          cellClass: 'readOnly',
        },
        {
          headerName: 'Body',
          width: 150,
          editable: false,
          cellRenderer: this.renderRequestBody,
          cellClass: 'readOnly',
        },
        {
          headerName: 'Docs',
          width: 70,
          editable: false,
          cellRenderer: this.renderRequestLinkDocs,
          cellClass: 'readOnly',
        },
        {
          headerName: 'Description',
          width: 310,
          editable: false,
          cellRenderer: this.renderRequestDescription,
          cellClass: 'readOnly',
        },
      ],
    },
  ];

  constructor(
    private logService: LogService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const requests = this.logService.getRequestLog();
    this.loading = false;
    this.prepareGrid(requests);
  }

  renderTime(params) {
    if (params.value) {
      const newDate = new Date();
      newDate.setTime(params.value);
      return newDate.toUTCString();
    }
    return ``;
  }

  renderUrl(params) {
    if (params.value) {
      return `<a href="${params.value}" >${params.value}</a>`;
    }
    return ``;
  }

  renderRequestLinkDocs(params) {
    if (
      params.data &&
      params.data.request &&
      params.data.request.url &&
      params.data.request.method
    ) {
      const url = params.data.request.url;
      const method = params.data.request.method;
      const baseUrl = 'https://api.archilyse.com/v0.1/ui/';

      if (method === 'GET') {
        if (url === apiUrl + 'sites') {
          return `<a href="${baseUrl}#!/Sites/get_sites" >View</a>`;
        } else if (url === apiUrl + 'buildings') {
          return `<a href="${baseUrl}#!/Buildings/get_buildings" >View</a>`;
        } else if (url === apiUrl + 'units') {
          return `<a href="${baseUrl}##!/Units/get_units" >View</a>`;
        } else if (url === apiUrl + 'layouts') {
          return `<a href="${baseUrl}#!/Layouts/get_layouts" >View</a>`;
        }
      } else if (method === 'POST') {
        if (url === apiUrl + 'sites') {
          return `<a href="${baseUrl}#!/Sites/post_sites" >View</a>`;
        } else if (url === apiUrl + 'buildings') {
          return `<a href="${baseUrl}#!/Buildings/post_buildings" >View</a>`;
        } else if (url === apiUrl + 'units') {
          return `<a href="${baseUrl}##!/Units/post_units" >View</a>`;
        } else if (url === apiUrl + 'layouts') {
          return `<a href="${baseUrl}#!/Layouts/post_layouts" >View</a>`;
        }
      } else if (method === 'DELETE') {
        if (url.startsWith(apiUrl + 'sites/')) {
          return `<a href="${baseUrl}#!/Sites/delete_site_by_id" >View</a>`;
        } else if (url.startsWith(apiUrl + 'buildings')) {
          return `<a href="${baseUrl}#!/Buildings/delete_building_by_id" >View</a>`;
        } else if (url.startsWith(apiUrl + 'units')) {
          return `<a href="${baseUrl}##!/Units/delete_unit_by_id" >View</a>`;
        } else if (url.startsWith(apiUrl + 'layouts')) {
          return `<a href="${baseUrl}#!/Layouts/delete_layout_by_id" >View</a>`;
        } else {
          return 'Description not yet available';
        }
      } else if (method === 'PATCH') {
        if (url.startsWith(apiUrl + 'sites/')) {
          return `<a href="${baseUrl}#!/Sites/patch_site_by_id" >View</a>`;
        } else if (url.startsWith(apiUrl + 'buildings')) {
          return `<a href="${baseUrl}#!/Buildings/patch_building_by_id" >View</a>`;
        } else if (url.startsWith(apiUrl + 'units')) {
          return `<a href="${baseUrl}##!/Units/patch_unit_by_id" >View</a>`;
        } else if (url.startsWith(apiUrl + 'layouts')) {
          return `<a href="${baseUrl}#!/Layouts/patch_layout_by_id" >View</a>`;
        } else {
          return 'Description not yet available';
        }
      }
    }
    return ``;
  }

  renderRequest(params) {
    if (params.value && params.value.url) {
      return params.value.url;
    }
    return ``;
  }

  renderRequestMethod(params) {
    if (params.data && params.data.request && params.data.request.method) {
      return params.data.request.method;
    }
    return ``;
  }

  renderRequestBody(params) {
    if (params.data && params.data.request && params.data.request.body) {
      return JSON.stringify(params.data.request.body);
    }
    return ``;
  }

  renderRequestDescription(params) {
    if (
      params.data &&
      params.data.request &&
      params.data.request.url &&
      params.data.request.method
    ) {
      const url = params.data.request.url;
      const method = params.data.request.method;

      if (method === 'GET') {
        if (url === apiUrl + 'sites') {
          return 'Requests all the sites';
        } else if (url === apiUrl + 'buildings') {
          return 'Requests all the buildings';
        } else if (url === apiUrl + 'units') {
          return 'Requests all the units';
        } else if (url === apiUrl + 'layouts') {
          return 'Requests all the layouts';
        } else {
          return 'Description not yet available';
        }
      } else if (method === 'POST') {
        if (url === apiUrl + 'sites') {
          return 'Creates a new site, with the values specified in the request body';
        } else if (url === apiUrl + 'buildings') {
          return 'Creates a new building, with the values specified in the request body';
        } else if (url === apiUrl + 'units') {
          return 'Creates a new unit, with the values specified in the request body';
        } else if (url === apiUrl + 'layouts') {
          return 'Creates a new layout, with the values specified in the request body';
        } else {
          return 'Description not yet available';
        }
      } else if (method === 'DELETE') {
        if (url.startsWith(apiUrl + 'sites/')) {
          return 'Deletes the specified site by the site_id';
        } else if (url.startsWith(apiUrl + 'buildings')) {
          return 'Deletes the specified building by the building_id';
        } else if (url.startsWith(apiUrl + 'units')) {
          return 'Deletes the specified unit by the unit_id';
        } else if (url.startsWith(apiUrl + 'layouts')) {
          return 'Deletes the specified layout by the layout_id';
        } else {
          return 'Description not yet available';
        }
      } else if (method === 'PATCH') {
        if (url.startsWith(apiUrl + 'sites/')) {
          return 'Updates the specified site by the site_id, with the new values specified in the request body';
        } else if (url.startsWith(apiUrl + 'buildings')) {
          return 'Updates the specified building by the building_id, with the new values specified in the request body';
        } else if (url.startsWith(apiUrl + 'units')) {
          return 'Updates the specified unit by the unit_id, with the new values specified in the request body';
        } else if (url.startsWith(apiUrl + 'layouts')) {
          return 'Updates the specified layout by the layout_id, with the new values specified in the request body';
        } else {
          return 'Description not yet available';
        }
      }
    }
    return ``;
  }

  prepareGrid(requestsArray) {
    this.gridOptions = {
      rowData: requestsArray,
      columnDefs: this.columnDefs,

      /** Pagination */
      ...ColumnDefinitions.pagination,
      ...ColumnDefinitions.columnOptions,

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
  }

  backPage() {
    window.history.back();
  }

  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }
}
