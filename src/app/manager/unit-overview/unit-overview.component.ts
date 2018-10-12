import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../../_shared-libraries/ManagerFunctions';
import { Building, Unit } from '../../_models';
import { ApiFunctions } from '../../_shared-libraries/ApiFunctions';
import { CellRender } from '../../_shared-libraries/CellRender';
import { ColumnDefinitions } from '../../_shared-libraries/ColumnDefinitions';
import {
  convertFileToWorkbook,
  exportOptions,
  exportSelectedOptions,
  getRows,
  showInfoExcel,
} from '../../_shared-libraries/ExcelManagement';
import { OverlayService, NavigationService } from '../../_services';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

const urlPortfolio = environment.urlPortfolio;

@Component({
  selector: 'app-floorplan-overview',
  templateUrl: './unit-overview.component.html',
  styleUrls: ['./unit-overview.component.scss'],
})
export class UnitOverviewComponent implements OnInit, OnDestroy {
  /**
   * Loading and general error
   */
  generalError = null;
  loading = true;

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

  columnDefs;

  /**
   * Local variables
   */
  @ViewChild('importFile') importField: ElementRef;

  buildingsArray;
  currentProfile;
  filtersHuman;

  /**
   * Subscriptions
   */
  fragment_sub: Subscription;

  buildColumDefinitions(buildings) {
    this.columnDefs = [
      {
        headerName: 'Building',
        headerTooltip: 'Parent building main properties',
        children: [
          {
            headerName: 'Building Id',
            field: 'building_id',
            width: 280,
            cellRenderer: 'linkRenderer',
            cellRendererParams: {
              type: 'viewBuilding',
              readOnlyKey: false,
            },
            cellEditor: 'agPopupSelectCellEditor',
            valueFormatter: CellRender.buildingFormatter.bind(this, this.currentProfile),
            cellEditorParams: {
              values: ['', ...buildings.map(building => building.building_id)],
            },
            editable: true,
          },
          {
            headerName: 'Georeferenced',
            field: 'building_referenced',
            hide: this.currentProfile === 'developer',
            cellRenderer: 'checkboxRenderer',
            width: 100,
            cellRendererParams: { editable: false },
            cellClass: 'readOnly',
          },
          {
            headerName: 'Swiss Topo',
            field: 'building_referenced_st',
            hide: this.currentProfile !== 'developer',
            cellRenderer: 'checkboxRenderer',
            width: 100,
            cellRendererParams: { editable: false },
            cellClass: 'readOnly',
          },
          {
            headerName: 'Open Street Maps',
            field: 'building_referenced_osm',
            hide: this.currentProfile !== 'developer',
            cellRenderer: 'checkboxRenderer',
            width: 100,
            cellRendererParams: { editable: false },
            cellClass: 'readOnly',
          },
          {
            headerName: 'Building Name',
            field: 'building_name',
            columnGroupShow: 'open',
            cellClass: 'readOnly',
            editable: false,
          },
        ],
      },
      {
        headerName: 'Unit',
        headerTooltip: 'Unit entity main properties',
        openByDefault: true,
        children: [
          {
            headerName: 'Unit Id',
            field: 'unit_id',
            columnGroupShow: 'open',
            hide: this.currentProfile !== 'developer',
            width: 255,
            editable: false,
            cellRenderer: CellRender.cellId,
            cellClass: 'idCell',
          },
          { headerName: 'Name', field: 'name', editable: true },
          {
            headerName: 'Description',
            columnGroupShow: 'open',
            field: 'description',
            editable: true,
          },
        ],
      },
      {
        headerName: 'Layouts',
        children: [
          {
            headerName: 'Amount',
            field: 'layouts',
            filter: 'agNumberColumnFilter',
            width: 105,
            cellRenderer: 'linkRenderer',
            cellRendererParams: {
              type: 'viewLayouts',
            },
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Progress',
            field: 'progressLayout',
            cellRenderer: 'procentRenderer',
            filter: 'agNumberColumnFilter',
            cellRendererParams: { editable: false },
            cellStyle: { padding: '0px' },
            cellClass: 'readOnly',
          },
        ],
      },
      {
        headerName: 'Unit address',
        openByDefault: this.currentProfile === 'data',
        children: [
          {
            headerName: 'Floor Nr',
            field: 'address.floor_nr',
            filter: 'agNumberColumnFilter',
            width: 105,
            editable: true,
          },
          {
            headerName: 'Additional',
            field: 'address.additional',
            editable: true,
            width: 250,
            columnGroupShow: 'open',
          },
        ],
      },
      /**
      {
        headerName: 'Images',
        headerTooltip: 'Current Layout uploaded pictures',
        children: [
          {
            headerName: 'Images',
            field: 'images',
            cellRenderer: CellRender.viewImg,
            editable: false,
            cellClass: 'readOnly',
          },
        ],
      },
       */
      ...ColumnDefinitions.metaUserAndData,
    ];
  }

  /**
   * Adds an empty unit in the API
   */
  addRow() {
    const newUnit = {
      name: '',
      description: '',
      address: {
        additional: '',
      },
    };

    ApiFunctions.post(
      this.http,
      'units',
      newUnit,
      units => {
        this.gridOptions.api.updateRowData({
          add: [units],
        });

        // We move to the last page. (After adding, because can be in a new page)
        this.gridOptions.api.paginationGoToLastPage();
        this.toastr.success('Unit added successfully');
      },
      ManagerFunctions.showErroruser
    );
  }

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

  viewBuilding(params) {
    if (params.value && params.value !== '' && params.value !== 'None') {
      return (
        `<i class="fas fa-key secondaryKey"></i> ` +
        params.value +
        `<a href='${urlPortfolio}/building#building_id=` +
        params.data.building_id +
        `' > View </a>`
      );
    }
    return '';
  }

  unitReactionToEdit(nodeData, element) {
    // if the new Layout has new unit id, we update the building data.
    if (element.building_id) {
      const buildingThisUnit = this.buildingsArray.find(
        building => building.building_id === nodeData.building_id
      );

      nodeData['building_name'] =
        buildingThisUnit && buildingThisUnit.name ? buildingThisUnit.name : '';

      nodeData['building_referenced'] =
        buildingThisUnit && ManagerFunctions.isReferencedBuilding(buildingThisUnit);
      nodeData['building_referenced_osm'] =
        buildingThisUnit && ManagerFunctions.isReferencedOSMBuilding(buildingThisUnit);
      nodeData['building_referenced_st'] =
        buildingThisUnit && ManagerFunctions.isReferencedSTBuilding(buildingThisUnit);
    }
  }

  ngOnInit() {}

  initComponent() {
    this.loading = true;
    this.filterModelSet = false;

    /** UNITS */

    ManagerFunctions.requestAllData(
      this.http,
      (sitesArray, buildingsArray, unitsArray, layoutsArray) => {
        this.loading = false;

        this.buildingsArray = buildingsArray;
        this.buildColumDefinitions(buildingsArray);

        unitsArray.forEach(unit => {
          const layoutsThisUnit = layoutsArray.filter(layout => layout.unit_id === unit.unit_id);

          const numLayouts = layoutsThisUnit.length;
          unit.layouts = numLayouts;
          let progressLayout = 0;
          if (numLayouts > 0) {
            const numReferenced = layoutsThisUnit.filter(layout =>
              ManagerFunctions.isReferencedLayout(layout)
            ).length;
            progressLayout = numReferenced * 100 / numLayouts;
          }
          unit['progressLayout'] = progressLayout;

          this.unitReactionToEdit(unit, unit);
        });

        this.gridOptions = {
          rowData: unitsArray,
          columnDefs: this.columnDefs,

          /** Pagination */
          ...ColumnDefinitions.pagination,
          ...ColumnDefinitions.columnOptions,

          getRowNodeId: data => data.unit_id,
          onCellValueChanged: params => {
            ManagerFunctions.reactToEdit(
              this.http,
              params,
              'unit_id',
              'units',
              this.gridOptions.api,
              this.unitReactionToEdit.bind(this)
            );
          },

          onFilterChanged: params => {
            const model = params.api.getFilterModel();
            this.filterModelSet = model !== null || Object.keys(model).length > 0;
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
      delete newRow['unit_id'];

      // Calculated are not duplicated
      delete newRow['building_name'];
      delete newRow['building_referenced'];
      delete newRow['building_referenced_osm'];
      delete newRow['building_referenced_st'];
      delete newRow['layouts'];
      delete newRow['progressLayout'];

      // Control fields are not duplicated
      delete newRow['org_id'];
      delete newRow['user_id'];
      delete newRow['updated'];
      delete newRow['created'];

      if (
        newRow['building_id'] &&
        (newRow['building_id'] === '' || newRow['building_id'] === 'None')
      ) {
        delete newRow['building_id'];
      }

      ApiFunctions.post(
        this.http,
        'units',
        newRow,
        unit => {
          // We populate the calculated fields
          this.unitReactionToEdit(unit, unit);

          // We update the data in the table
          this.gridOptions.api.updateRowData({
            add: [unit],
          });

          // We move to the last page. (After adding, because can be in a new page)
          this.gridOptions.api.paginationGoToLastPage();
          this.toastr.success('Unit copied successfully');
        },
        ManagerFunctions.showErroruser
      );
    });
  }

  /**
   * Deletes the selected rows in the API
   */
  delete() {
    let layouts = 0;

    this.selectedRows.forEach(site => {
      layouts += site.layouts;
    });

    let warning = null;
    if (layouts > 0) {
      if (layouts > 1) {
        warning = `There're ${layouts} layout associated`;
      } else if (layouts === 1) {
        warning = `There's a layout associated`;
      }
    }

    ManagerFunctions.reactToDelete(
      this.toastr,
      this.http,
      this.selectedRows,
      this.gridOptions.api,
      'unit',
      'units',
      'unit_id',
      'units',
      warning
    );
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

  /**
   * Import / Export functions
   */
  showInfoExcel() {
    this.infoDialog.open(showInfoExcel);
  }
  importExcel(files) {
    if (files.length === 1) {
      convertFileToWorkbook(files[0], result => {
        const dictionaryUnits = {};
        dictionaryUnits['Building id'] = 'building_id';
        dictionaryUnits['Unit id'] = 'unit_id';
        dictionaryUnits['Name'] = 'name';
        dictionaryUnits['Description'] = 'description';

        dictionaryUnits['Line1'] = 'address.line1';
        dictionaryUnits['Line2'] = 'address.line2';
        dictionaryUnits['Line3'] = 'address.line3';

        const allRows = getRows(result, dictionaryUnits);

        let addedRows = 0;
        let updatedRows = 0;

        console.log('allRows ', allRows);
        allRows.forEach(oneRow => {
          if (oneRow.unit_id && oneRow.unit_id !== null && oneRow.unit_id !== '') {
            const unit_id = oneRow.unit_id;
            delete oneRow.unit_id;

            updatedRows += 1;

            ApiFunctions.patch(
              this.http,
              'units/' + unit_id,
              oneRow,
              unit => {
                const node = this.gridOptions.api.getRowNode(unit_id);
                this.unitReactionToEdit(unit, unit);
                node.setData(unit);
              },
              ManagerFunctions.showErrorUserNoReload
            );
          } else {
            addedRows += 1;

            // We never send the unit id, even when is ''
            delete oneRow.unit_id;

            ApiFunctions.post(
              this.http,
              'units',
              oneRow,
              unit => {
                this.unitReactionToEdit(unit, unit);
                this.gridOptions.api.updateRowData({
                  add: [unit],
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
          `Units added: ${addedRows}, updated: ${updatedRows}.`,
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

  export() {
    this.gridOptions.api.exportDataAsCsv(exportOptions);
  }
  exportSelected() {
    this.gridOptions.api.exportDataAsCsv(exportSelectedOptions);
  }
}
