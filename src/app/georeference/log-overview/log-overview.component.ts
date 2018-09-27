import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { LogService } from '../../_services';
import { ColumnDefinitions } from '../columnDefinitions';
import { ManagerFunctions } from '../managerFunctions';
import { Subscription } from 'rxjs/Subscription';
import { renderRequestDescription, renderRequestLinkDocs } from './logLinks';
import {
  renderRequest,
  renderRequestBody,
  renderRequestMethod,
  renderTime,
  renderUrl,
} from './logRenderMethods';

@Component({
  selector: 'app-log-overview',
  templateUrl: './log-overview.component.html',
  styleUrls: ['./log-overview.component.scss'],
})
export class LogOverviewComponent implements OnInit, OnDestroy {
  /**
   * Loading and general error
   */

  generalError = null;
  loading = true;

  /**
   * TABLE DOCUMENTATION
   * https://www.ag-grid.com/angular-getting-started/
   * ag- grid parameters:
   */

  selectedNodes = [];
  selectedRows = [];

  gridApi;
  gridColumnApi;

  filterModelSet = false;

  gridOptions;

  columnDefs = [
    {
      headerName: 'RApi Request Log',
      children: [
        {
          headerName: 'Time',
          field: 'time',
          width: 210,
          editable: false,
          cellRenderer: renderTime,
          cellClass: 'readOnly',
        },
        {
          headerName: 'URL',
          field: 'url',
          width: 210,
          editable: false,
          cellRenderer: renderUrl,
          cellClass: 'readOnly',
        },
        {
          headerName: 'Method',
          width: 90,
          editable: false,
          cellRenderer: renderRequestMethod,
          cellClass: 'readOnly',
        },
        {
          headerName: 'Request',
          field: 'request',
          width: 290,
          editable: false,
          cellRenderer: renderRequest,
          cellClass: 'readOnly',
        },
        {
          headerName: 'Body',
          width: 150,
          editable: false,
          cellRenderer: renderRequestBody,
          cellClass: 'readOnly',
        },
        {
          headerName: 'Docs',
          width: 70,
          editable: false,
          cellRenderer: renderRequestLinkDocs,
          cellClass: 'readOnly',
        },
        {
          headerName: 'Description',
          width: 310,
          editable: false,
          cellRenderer: renderRequestDescription,
          cellClass: 'readOnly',
        },
      ],
    },
  ];

  /**
   * Subscriptions
   */
  fragment_sub: Subscription;

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

  /**
   * Prepare the ag-grid
   * @param requestsArray
   */
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

  /**
   * Link to the previous page
   */
  backPage() {
    window.history.back();
  }

  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }
}
