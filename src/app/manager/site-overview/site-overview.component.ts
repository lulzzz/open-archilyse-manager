import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../../_shared-libraries/ManagerFunctions';
import { Site } from '../../_models';
import { ApiFunctions } from '../../_shared-libraries/ApiFunctions';
import { ColumnDefinitions } from '../../_shared-libraries/ColumnDefinitions';
import { CellRender } from '../../_shared-libraries/CellRender';
import {
  convertFileToWorkbook,
  exportOptions,
  exportSelectedOptions,
  getRows,
  showInfoExcel,
} from '../../_shared-libraries/ExcelManagement';
import { OverlayService, NavigationService } from '../../_services';
import { ToastrService } from 'ngx-toastr';

/**
 * API site entity overview table
 */
@Component({
  selector: 'app-site-overview',
  templateUrl: './site-overview.component.html',
  styleUrls: ['./site-overview.component.scss'],
})
export class SiteOverviewComponent implements OnInit, OnDestroy {
  /** String container of any error */
  generalError = null;

  /** True to start and false once all the data is loaded */
  loading = true;

  /**
   * TABLE DOCUMENTATION
   * https://www.ag-grid.com/angular-getting-started/
   * ag- grid parameters:
   */

  /** Ag-grid selected nodes */
  selectedNodes = [];
  /** Ag-grid selected rows */
  selectedRows = [];

  /** ag-grid api */
  gridApi;
  /** ag-grid column api */
  gridColumnApi;

  /** are any filters set? */
  filterModelSet = false;

  /** Configuration options for Ag-Grid  */
  gridOptions;

  /** Column definition for Ag-Grid */
  columnDefs;

  /**
   * Local variables
   */
  @ViewChild('importFile') importField: ElementRef;

  /** user profile */
  currentProfile;
  filtersHuman;

  /**
   * Subscriptions
   */
  fragment_sub: Subscription;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private infoDialog: OverlayService,
    private navigationService: NavigationService,
    private toastr: ToastrService
  ) {
    navigationService.profile$.subscribe(newProfile => {
      this.currentProfile = newProfile;
      this.initComponent();
    });
  }

  /**
   * Adds an empty site in the API
   */
  addRow() {
    const newSite = {
      description: '',
      name: '',
    };

    ApiFunctions.post(
      this.http,
      'sites',
      newSite,
      site => {
        this.gridOptions.api.updateRowData({
          add: [site],
        });

        // We move to the last page. (After adding, because can be in a new page)
        this.gridOptions.api.paginationGoToLastPage();
        this.toastr.success('Site added successfully');
      },
      ManagerFunctions.showErroruser
    );
  }

  ngOnInit() {}

  setUpColumns() {
    let analysisColumns = [];

    if (this.currentProfile === 'analyst' || this.currentProfile === 'data') {
      analysisColumns = [
        {
          headerName: 'Count',
          hide: this.currentProfile !== 'analyst',
          headerTooltip: 'Number of elements assigned to this site',
          children: ColumnDefinitions.getBuildingsUnitsLayouts(
            'linkRenderer',
            { type: 'viewBuildingNumberSite' },
            null,
            null
          ),
        },
        {
          headerName: 'Progress Georeferencing',
          hide: this.currentProfile !== 'analyst',
          headerTooltip: 'Procent of georeferenced buildings and layouts',
          children: ColumnDefinitions.progressProcents,
        },
      ];
    }

    this.columnDefs = [
      {
        headerName: 'Site',
        openByDefault: true,
        headerTooltip: 'Site entity main properties',
        children: [
          {
            headerName: 'Site Id',
            field: 'site_id',
            hide: this.currentProfile !== 'developer',
            columnGroupShow: 'open',
            width: 255,
            editable: false,
            cellRenderer: CellRender.cellId,
            cellClass: 'idCell',
          },
          { headerName: 'Name', field: 'name', width: 190, editable: true },
          {
            headerName: 'Description',
            columnGroupShow: 'open',
            field: 'description',
            width: 300,
            editable: true,
          },
        ],
      },
      ...analysisColumns,
      /**
       {
      headerName: 'Building Simulations ',
      children: ColumnDefinitions.progressSimsBuilding,
    },
       {
      headerName: 'Layout Simulations ',
      children: ColumnDefinitions.progressSimsLayout,
    },
       */
      ...ColumnDefinitions.metaUserAndData,
    ];
  }

  initComponent() {
    this.loading = true;
    this.filterModelSet = false;

    /** SITES */
    ManagerFunctions.requestAllData(
      this.http,
      (sitesArray, buildingsArray, unitsArray, layoutsArray) => {
        this.loading = false;

        sitesArray.forEach(site => {
          const buildingsThisSite = buildingsArray.filter(
            building => building.site_id === site.site_id
          );

          const progressResult = ManagerFunctions.progressOutOfBuildings(
            buildingsThisSite,
            unitsArray,
            layoutsArray
          );

          site.buildings = progressResult.numberOfBuildings;
          site.units = progressResult.numberOfUnits;
          site.layouts = progressResult.numberOfLayouts;
          site.progress = progressResult.progressOfBuildings;
          site.progressLayout = progressResult.progressOfLayouts;
        });

        this.setUpColumns();

        this.gridOptions = {
          rowData: sitesArray,
          columnDefs: this.columnDefs,

          /** Pagination */
          ...ColumnDefinitions.pagination,
          ...ColumnDefinitions.columnOptions,

          getRowNodeId: data => data.site_id,
          onCellValueChanged: params => {
            ManagerFunctions.reactToEdit(
              this.http,
              params,
              'site_id',
              'sites',
              this.gridOptions.api
            );
          },

          onFilterChanged: params => {
            const model = params.api.getFilterModel();
            this.filterModelSet =
              model !== null && Object.keys(model).length > 0;
            this.filtersHuman = ManagerFunctions.calculateHumanFilters(
              model,
              this.filterModelSet,
              sitesArray,
              buildingsArray,
              unitsArray,
              layoutsArray
            );
          },
          onSelectionChanged: () => {
            if (this.gridOptions && this.gridOptions.api) {
              this.selectedNodes = this.gridOptions.api.getSelectedNodes();
              this.selectedRows = this.gridOptions.api.getSelectedRows();
            }
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
      },
      error => {
        this.generalError = `<div class="title">Unknown error requesting the API data: </div> ${
          error.message
        }`;
      }
    );
  }

  /**
   * We duplicate the selected rows
   * Before that we remove the not needed attributes
   */
  duplicate() {
    this.selectedRows.forEach(selectedRow => {
      const newRow = {};
      Object.assign(newRow, ...selectedRow);

      // Id is not duplicated
      delete newRow['site_id'];

      // Control fields are not duplicated
      delete newRow['org_id'];
      delete newRow['user_id'];
      delete newRow['updated'];
      delete newRow['created'];

      ApiFunctions.post(
        this.http,
        'sites',
        newRow,
        site => {
          this.gridOptions.api.updateRowData({
            add: [site],
          });

          // We move to the last page. (After adding, because can be in a new page)
          this.gridOptions.api.paginationGoToLastPage();
          this.toastr.success('Site copied successfully');
        },
        ManagerFunctions.showErroruser
      );
    });
  }

  /**
   * Deletes the selected rows in the API
   */
  delete() {
    let buildings = 0;
    let layouts = 0;
    let units = 0;

    this.selectedRows.forEach(site => {
      buildings += site.buildings;
      layouts += site.layouts;
      units += site.units;
    });

    let warning = null;
    if (buildings > 0) {
      let waringBuildings;
      if (buildings > 1) {
        waringBuildings = `There're ${buildings} buildings`;
      } else {
        waringBuildings = `There's a building`;
      }

      let waringUnits;
      if (units > 1) {
        waringUnits = `${units} units`;
      } else if (units === 1) {
        waringUnits = `an unit `;
      } else {
        waringUnits = `no units `;
      }

      let waringLayouts;
      if (layouts > 1) {
        waringLayouts = `${layouts} layouts`;
      } else if (layouts === 1) {
        waringLayouts = `a layout `;
      } else {
        waringLayouts = `no layouts `;
      }

      warning = `${waringBuildings}, ${waringUnits} and ${waringLayouts} associated.`;
    }

    ManagerFunctions.reactToDelete(
      this.toastr,
      this.http,
      this.selectedRows,
      this.gridOptions.api,
      'site',
      'sites',
      'site_id',
      'sites',
      warning
    );
  }

  /** Clean all the selected rows from the Ag-grid table */
  clearSelection() {
    ManagerFunctions.clearSelection(this.gridOptions.api);
  }

  /** Clean all the filters from the Ag-grid table */
  clearFilters() {
    this.filterModelSet = false;
    this.gridApi.setFilterModel(null);
  }

  /** Unsubscribe before destroying */
  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }

  /**
   * Import / Export functions
   * https://stackoverflow.com/questions/11832930/html-input-file-accept-attribute-file-type-csv
   */

  /** Show import instructions to import an excel file */
  showInfoExcel() {
    this.infoDialog.open(showInfoExcel);
  }

  /**
   * Imports an Excel with site
   * @param files
   */
  importExcel(files) {
    if (files.length === 1) {
      convertFileToWorkbook(files[0], result => {
        const dictionarySites = {};
        dictionarySites['Site Id'] = 'site_id';
        dictionarySites['Name'] = 'name';
        dictionarySites['Description'] = 'description';
        const allRows = getRows(result, dictionarySites);

        let addedRows = 0;
        let updatedRows = 0;

        console.log('allRows ', allRows);
        allRows.forEach(oneRow => {
          if (
            oneRow.site_id &&
            oneRow.site_id !== null &&
            oneRow.site_id !== ''
          ) {
            const site_id = oneRow.site_id;
            delete oneRow.site_id;

            updatedRows += 1;

            ApiFunctions.patch(
              this.http,
              'sites/' + site_id,
              oneRow,
              site => {
                const node = this.gridOptions.api.getRowNode(site_id);
                node.setData(site);
              },
              ManagerFunctions.showErrorUserNoReload
            );
          } else {
            addedRows += 1;

            // We never send the site id, even when is ''
            delete oneRow.site_id;

            ApiFunctions.post(
              this.http,
              'sites',
              oneRow,
              site => {
                this.gridOptions.api.updateRowData({
                  add: [site],
                });

                // We move to the last page. (After adding, because can be in a new page)
                this.gridOptions.api.paginationGoToLastPage();
              },
              ManagerFunctions.showErrorUserNoReload
            );
          }
        });

        ManagerFunctions.showWarning(
          'Import completed',
          `Sites added: ${addedRows}, updated: ${updatedRows}.`,
          'Ok',
          () => {}
        );
      });
    } else if (files.length > 1) {
      ManagerFunctions.showWarning(
        'Import error',
        'Please select only once file to import.',
        'Ok',
        () => {}
      );
    }

    // We reset the input
    this.importField.nativeElement.value = '';
  }

  /**
   * Export functions
   */

  /** Export everything */
  export() {
    this.gridOptions.api.exportDataAsCsv(exportOptions);
  }
  /** Export selected nodes only */
  exportSelected() {
    this.gridOptions.api.exportDataAsCsv(exportSelectedOptions);
  }
}
