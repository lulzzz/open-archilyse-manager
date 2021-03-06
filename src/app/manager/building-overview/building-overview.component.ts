import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../../_shared-libraries/ManagerFunctions';
import { Building, Site } from '../../_models';
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

/**
 * Add the Swiss topo projection
 */
import { ToastrService } from 'ngx-toastr';
import { registerAllProjections } from '../../_shared-libraries/MapProjections';
registerAllProjections();

/**
 * API building entity overview table
 */
@Component({
  selector: 'app-building-overview',
  templateUrl: './building-overview.component.html',
  styleUrls: ['./building-overview.component.scss'],
})
export class BuildingOverviewComponent implements OnInit, OnDestroy {
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

  sitesArray;

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
   * In order to provide dropdowns with site lists we need to build it after load.
   * @param sites
   */
  buildColumDefinitions(sites) {
    let analysisColumns = [];
    let analysisColumns2 = [];
    if (this.currentProfile === 'analyst' || this.currentProfile === 'data') {
      analysisColumns = [
        {
          headerName: 'Units',
          children: [
            {
              headerName: 'Units',
              field: 'units',
              filter: 'agNumberColumnFilter',
              width: 90,
              cellRenderer: 'linkRenderer',
              cellRendererParams: {
                type: 'viewUnitsOfBuilding',
              },
              // cellRenderer: CellRender.viewUnitsOfBuilding,
              editable: false,
              cellClass: 'readOnly',
            },
            {
              headerName: 'Layouts',
              field: 'layouts',
              columnGroupShow: 'open',
              filter: 'agNumberColumnFilter',
              width: 90,
              editable: false,
              cellClass: 'readOnly',
            },
          ],
        },
      ];

      analysisColumns2 = [
        {
          headerName: 'Progress',
          children: [
            {
              headerName: 'Layouts',
              field: 'progressLayout',
              cellRenderer: 'procentRenderer',
              filter: 'agNumberColumnFilter',
              cellRendererParams: { editable: false },
              cellStyle: { padding: '0px' },
              cellClass: 'readOnly',
            },
          ],
        },
      ];
    }

    this.columnDefs = [
      {
        headerName: 'Site',
        headerTooltip: 'Parent site main properties',
        openByDefault: false,
        children: [
          {
            headerName: 'Site Id',
            field: 'site_id',
            width: 285,
            cellRenderer: 'linkRenderer',
            cellRendererParams: {
              type: 'viewSiteOfBuilding',
              readOnlyKey: false,
            },
            cellEditor: 'agPopupSelectCellEditor',
            cellEditorParams: {
              values: ['', ...sites.map(site => site.site_id)],
            },
            valueFormatter: CellRender.siteFormatter.bind(
              this,
              this.currentProfile
            ),
            editable: true,
          },
          {
            headerName: 'Site Name',
            columnGroupShow: 'open',
            field: 'site_name',
            editable: false,
            cellClass: 'readOnly',
          },
        ],
      },
      {
        headerName: 'Building',
        headerTooltip: 'Building entity main properties',
        openByDefault: true,
        children: [
          {
            headerName: 'Building Id',
            columnGroupShow: 'open',
            field: 'building_id',
            width: 255,
            hide: this.currentProfile !== 'developer',
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
        headerName: 'Building Address',
        // The address is open for the Data Input profile.
        openByDefault: this.currentProfile === 'data',
        headerTooltip:
          'Address properties for the current building, necessary for the DPOI simulation and georefence operations',
        children: [
          {
            headerName: 'Country',
            columnGroupShow: 'open',
            field: 'address.country',
            editable: true,
          },
          {
            headerName: 'City',
            columnGroupShow: 'open',
            field: 'address.city',
            editable: true,
          },
          { headerName: 'Street', field: 'address.street', editable: true },
          {
            headerName: 'Street Nr',
            field: 'address.street_nr',
            width: 100,
            editable: true,
          },
          {
            headerName: 'Postal Code',
            field: 'address.postal_code',
            width: 110,
            editable: true,
          },
        ],
      },
      ...analysisColumns.concat([
        {
          headerName: 'Georeference',
          children: [
            // { headerName: 'Building_reference', field: 'building_reference', editable: true },
            {
              headerName: 'Status',
              field: 'building_referenced',
              cellRenderer: 'checkboxRenderer',
              hide: this.currentProfile === 'developer', // No developers see overview
              width: 100,
              cellRendererParams: { editable: false },
              cellClass: 'readOnly',
            },
            {
              headerName: 'Swiss topo',
              field: 'building_referenced_st',
              hide: this.currentProfile !== 'developer', // A developer sees the details
              width: 265,
              cellRenderer: 'georeferenceRenderer',
              cellRendererParams: { type: 'building_st' },
              editable: false,
              cellClass: 'readOnly',
            },
            {
              headerName: 'Open Street Maps',
              field: 'building_referenced_osm',
              hide: this.currentProfile !== 'developer', // A developer sees the details
              width: 150,
              cellRenderer: 'georeferenceRenderer',
              cellRendererParams: { type: 'building_osm' },
              editable: false,
              cellClass: 'readOnly',
            },
          ],
        },
        {
          headerName: 'Building data',
          children: [
            {
              headerName: 'Height',
              field: 'height',
              width: 100,
              editable: true,
              cellRenderer: CellRender.viewHeight,
              filter: 'agNumberColumnFilter',
              cellClass: 'right',
            },
            {
              headerName: 'Floors',
              field: 'number_of_floors',
              width: 90,
              editable: true,
              filter: 'agNumberColumnFilter',
              cellClass: 'right',
            },
          ],
        },
        {
          headerName: 'Simulations',
          children: [
            {
              headerName: 'Potential view',
              field: 'simulation_statuses.potential_view.status',
              cellRenderer: 'simulationBuildingRenderer',
              cellStyle: { padding: '0px' },
              width: this.currentProfile === 'developer' ? 200 : 165,
              editable: false,
              cellClass: 'readOnly',
            },
            {
              headerName: 'DPOI',
              field: 'simulation_statuses.dpoi.status',
              cellRenderer: 'simulationBuildingDpoiRenderer',
              cellStyle: { padding: '0px' },
              width: this.currentProfile === 'developer' ? 235 : 195, // Smaller because there's no "raw"  view
              editable: false,
              cellClass: 'readOnly',
            },
          ],
        },
      ]),
      ...analysisColumns2.concat([
        /**
         {
        headerName: 'Layout Simulations ',
        children: ColumnDefinitions.progressSimsLayout,
      },
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
      ]),
    ];
  }

  /**
   * When a building is edited side effects might happen like:
   * Georeferenced -> number_of_floors, height & footprints are set
   * Changed address -> Georeferenced -> number_of_floors, height & footprints are set
   * @param nodeData
   * @param element
   */
  buildingReactionToEdit(nodeData, element) {
    // if the new Layout has new unit id, we update the building data.
    if (element.site_id || element.site_id === '') {
      this.setBuildingSiteData(nodeData);
    }

    if (element.height) {
      nodeData['height'] = element.height;
    }
    if (element.number_of_floors) {
      nodeData['number_of_floors'] = element.number_of_floors;
    }

    if (element.footprints) {
      nodeData['footprints'] = element.footprints;
    }
    if (element.building_references) {
      nodeData['building_references'] = element.building_references;
    }

    // Update if it's referenced
    nodeData[
      'building_referenced_st'
    ] = ManagerFunctions.isReferencedSTBuilding(element);
    nodeData[
      'building_referenced_osm'
    ] = ManagerFunctions.isReferencedOSMBuilding(element);
    nodeData['building_referenced'] =
      nodeData['building_referenced_st'] || nodeData['building_referenced_osm'];
  }
  setBuildingSiteData(building) {
    if (building.site_id || building.site_id === '') {
      const site = this.sitesArray.find(
        site => site.site_id === building.site_id
      );
      if (site) {
        building['site_name'] = site.name ? site.name : '';
      } else {
        building['site_name'] = '';
      }
    } else {
      building['site_name'] = '';
    }
  }

  ngOnInit() {}

  /**
   * Main set up of the table
   */
  initComponent() {
    this.loading = true;
    this.filterModelSet = false;

    /** BUILDINGS */
    ManagerFunctions.requestAllData(
      this.http,
      (sitesArray, buildingsArray, unitsArray, layoutsArray) => {
        this.sitesArray = sitesArray;
        this.loading = false;

        this.buildColumDefinitions(sitesArray);

        buildingsArray.forEach(building => {
          const progressResult = ManagerFunctions.progressOutOfBuildings(
            [building],
            unitsArray,
            layoutsArray
          );

          building.units = progressResult.numberOfUnits;
          building.layouts = progressResult.numberOfLayouts;
          building.progressLayout = progressResult.progressOfLayouts;

          this.buildingReactionToEdit(building, building);
        });

        this.gridOptions = {
          // <GridOptions>
          rowData: buildingsArray,
          columnDefs: this.columnDefs,

          /** Pagination */
          ...ColumnDefinitions.pagination,
          ...ColumnDefinitions.columnOptions,

          getRowNodeId: data => data.building_id,
          onCellValueChanged: params => {
            ManagerFunctions.reactToEdit(
              this.http,
              params,
              'building_id',
              'buildings',
              this.gridOptions.api,
              this.buildingReactionToEdit.bind(this)
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

  /** Clean all the selected rows from the Ag-grid table */
  clearSelection() {
    ManagerFunctions.clearSelection(this.gridOptions.api);
  }

  selectNotGeoreferenced() {
    this.gridOptions.api.selectAll();
    const nodes = this.gridOptions.api.getSelectedNodes();
    nodes.forEach(node => {
      if (ManagerFunctions.isReferencedBuilding(node.data)) {
        node.setSelected(false);
      }
    });
  }

  /**
   * Adds an empty building in the API
   */
  addRow() {
    const newBuilding = {
      address: {
        city: '',
        country: '',
        postal_code: '',
        street: '',
        street_nr: '',
      },
      building_references: [],
      description: '',
      images: '',
      name: '',
    };

    ApiFunctions.post(
      this.http,
      'buildings',
      newBuilding,
      building => {
        this.gridOptions.api.updateRowData({
          add: [building],
        });
        // We move to the last page. (After adding, because can be in a new page)
        this.gridOptions.api.paginationGoToLastPage();
        this.toastr.success('Building added successfully');
      },
      ManagerFunctions.showErroruser
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
      delete newRow['building_id'];

      // Simulations & footprints
      delete newRow['footprints'];
      delete newRow['simulation_statuses'];

      // Calculated are not duplicated
      delete newRow['units'];
      delete newRow['layouts'];
      delete newRow['progressLayout'];
      delete newRow['building_referenced'];
      delete newRow['building_referenced_st'];
      delete newRow['building_referenced_osm'];

      // Control fields are not duplicated
      delete newRow['org_id'];
      delete newRow['user_id'];
      delete newRow['updated'];
      delete newRow['created'];

      if (
        newRow['site_id'] &&
        (newRow['site_id'] === '' || newRow['site_id'] === 'None')
      ) {
        delete newRow['site_id'];
      }
      delete newRow['site_name'];

      ApiFunctions.post(
        this.http,
        'buildings',
        newRow,
        building => {
          this.buildingReactionToEdit(building, building);
          this.gridOptions.api.updateRowData({
            add: [building],
          });

          // We move to the last page. (After adding, because can be in a new page)
          this.gridOptions.api.paginationGoToLastPage();
          this.toastr.success('Building copied successfully');
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
    let units = 0;

    this.selectedRows.forEach(site => {
      layouts += site.layouts;
      units += site.units;
    });

    let warning = null;
    if (units > 0) {
      let waringUnits;
      if (units > 1) {
        waringUnits = `There're ${units} units`;
      } else if (units === 1) {
        waringUnits = `There's an unit `;
      }

      let waringLayouts;
      if (layouts > 1) {
        waringLayouts = `${layouts} layouts`;
      } else if (layouts === 1) {
        waringLayouts = `a layout `;
      } else {
        waringLayouts = `no layouts `;
      }

      warning = `${waringUnits} and ${waringLayouts} associated.`;
    }

    ManagerFunctions.reactToDelete(
      this.toastr,
      this.http,
      this.selectedRows,
      this.gridOptions.api,
      'building',
      'buildings',
      'building_id',
      'buildings',
      warning
    );
  }

  georeferenceOSM() {
    this.georeference('open_street_maps');
  }

  georeferenceAuto() {
    const nodes = this.gridOptions.api.getSelectedNodes();
    nodes.forEach(node => {
      if (ManagerFunctions.isAddressCorrect(node.data)) {
        // For each building
        const building = node.data;
        const buildingId = building['building_id'];
        ApiFunctions.get(
          this.http,
          'buildings/' + buildingId + '/surroundings',
          surroundings => {
            console.log('surroundings', surroundings);
            if (surroundings['top_shot_id']) {
              ApiFunctions.patch(
                this.http,
                'buildings/' + buildingId,
                {
                  building_references: [
                    {
                      id: surroundings['top_shot_id'],
                      source: 'swiss_topo',
                    },
                  ],
                },
                building => {
                  const node = this.gridOptions.api.getRowNode(buildingId);
                  this.buildingReactionToEdit(building, building);
                  node.setData(building);
                },
                ManagerFunctions.showErrorUserNoReload
              );
            }
          }
        );
      }
    });
  }

  georeference(src) {
    const nodes = this.gridOptions.api.getSelectedNodes();

    const numBuildings = nodes.length;
    let addressesCorrect = 0;
    nodes.forEach(node => {
      if (ManagerFunctions.isAddressCorrect(node.data)) {
        addressesCorrect += 1;
      }
    });

    if (addressesCorrect < numBuildings) {
      const withNoAdress = numBuildings - addressesCorrect;

      ManagerFunctions.showWarning(
        'Buildings with no address',
        withNoAdress === 1
          ? `There is a building in your selection that has not valid addresses.`
          : `There are ${withNoAdress} buildings in your selection that have not valid addresses.`,
        `Continue anyway`,
        confirmed => {
          if (confirmed) {
            this.geoRefBuildings(numBuildings, nodes, src);
          }
        }
      );
    } else {
      this.geoRefBuildings(numBuildings, nodes, src);
    }
  }

  geoRefBuildings(numBuildings, nodes, src) {
    if (numBuildings === 1) {
      const node = nodes[0];

      this.router.navigate(['georeference', 'map', node.data.building_id], {
        fragment: src ? `source=${src}` : null,
      });
    } else if (numBuildings > 1) {
      const building_ids = nodes.map(node => node.data.building_id);
      const list = building_ids.join('\t\n') + '\t\n';

      this.router.navigate(['georeference', 'multiple'], {
        fragment: 'list=' + list + '' + (src ? `&source=${src}` : ''),
      });
    }
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
   * startSimulations
   */
  getSimulationStatus() {
    const nodes = this.gridOptions.api.getSelectedNodes();
    nodes.forEach(node => {
      const building = node.data;
      console.log('get Building simulation status for ', building.building_id);
      ManagerFunctions.requestBuildingSimulationsStatus(
        this.http,
        building,
        this.gridOptions.api
      );
    });
  }

  compareDpoiSimulations() {
    const nodes = this.gridOptions.api.getSelectedNodes();
    if (nodes.length === 2) {
      if (nodes[0] && nodes[0].data && nodes[0].data.building_id) {
        if (nodes[1] && nodes[1].data && nodes[1].data.building_id) {
          const building_id1 = nodes[0].data.building_id;
          const building_id2 = nodes[1].data.building_id;
          // ManagerFunctions.openLink(`${urlPortfolio}/dpoi/${building_id1}/${building_id2}`);
          this.router.navigate(['manager', 'dpoi', building_id1, building_id2]);
        } else {
          console.error('Second link wrong, ', nodes);
        }
      } else {
        console.error('First link wrong, ', nodes);
      }
    } else {
      console.error('Wrong number of links, ', nodes);
    }
  }

  /**
   * Get all the selected nodes and try to start the simulations
   */
  startSimulations() {
    const nodes = this.gridOptions.api.getSelectedNodes();
    const buildings = nodes.map(node => node.data);

    const georefbuildings = buildings.filter(building =>
      ManagerFunctions.isReferencedBuilding(building)
    );

    if (georefbuildings.length !== buildings.length) {
      ManagerFunctions.showWarning(
        'Not Georeferenced buildings',
        `There are ${buildings.length -
          georefbuildings.length} buildings in your selection that are not georeferenced. Those buildings would be skipped.`,
        `Skip and continue`,
        confirmed => {
          if (confirmed) {
            this.startSimulationsViaBuildings(buildings);
          }
        }
      );
    } else {
      this.startSimulationsViaBuildings(buildings);
    }
  }

  /**
   * Try to start the simulations for the selected buildings
   */
  startSimulationsViaBuildings(buildings) {
    buildings.forEach(building => {
      console.log('Start Building simulations for ', building.building_id);

      // We request all the floors
      const numberOfFloors = building.number_of_floors
        ? building.number_of_floors
        : 1;
      const floorArray = [];
      for (let i = 0; i < numberOfFloors; i += 1) {
        floorArray.push(i);
      }

      const simsRequested = [
        {
          name: 'potential_view',
          parameters: {
            floors: floorArray,
          },
        },
        {
          name: 'dpoi',
        },
      ]; // TODO: 'accoustics',
      ManagerFunctions.requestBuildingSimulations(
        this.http,
        building,
        simsRequested,
        this.gridOptions.api
      );
    });
  }

  /**
   * Import / Export functions
   */

  /** Show import instructions to import an excel file */
  showInfoExcel() {
    this.infoDialog.open(showInfoExcel);
  }

  /**
   * Imports an Excel with buildings
   * @param files
   */
  importExcel(files) {
    console.log('files', files);

    if (files.length === 1) {
      convertFileToWorkbook(files[0], result => {
        console.log('result', result);

        const dictionaryBuildings = {};

        dictionaryBuildings['Site Id'] = 'site_id';
        dictionaryBuildings['Building Id'] = 'building_id';
        dictionaryBuildings['Name'] = 'name';
        dictionaryBuildings['Description'] = 'description';

        // address
        dictionaryBuildings['Country'] = 'address.country';
        dictionaryBuildings['City'] = 'address.city';
        dictionaryBuildings['Street'] = 'address.street';
        dictionaryBuildings['Street Nr'] = 'address.street_nr';
        dictionaryBuildings['Postal Code'] = 'address.postal_code';

        // building_reference
        // dictionaryBuildings['Swiss topo'] = 'building_reference.swiss_topo';
        // dictionaryBuildings['Open Street Maps'] = 'building_reference.open_street_maps';

        // Images
        dictionaryBuildings['Images'] = 'images';

        const allRows = getRows(result, dictionaryBuildings);

        let addedRows = 0;
        let updatedRows = 0;

        allRows.forEach(oneRow => {
          if (
            oneRow.building_id &&
            oneRow.building_id !== null &&
            oneRow.building_id !== ''
          ) {
            const building_id = oneRow.building_id;
            delete oneRow.building_id;

            updatedRows += 1;

            ApiFunctions.patch(
              this.http,
              'buildings/' + building_id,
              oneRow,
              building => {
                const node = this.gridOptions.api.getRowNode(building_id);
                this.buildingReactionToEdit(building, building);
                node.setData(building);
              },
              ManagerFunctions.showErrorUserNoReload
            );
          } else {
            addedRows += 1;

            // We never send the building id, even when is ''
            delete oneRow.building_id;

            ApiFunctions.post(
              this.http,
              'buildings',
              oneRow,
              building => {
                this.buildingReactionToEdit(building, building);
                this.gridOptions.api.updateRowData({
                  add: [building],
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
          `Buildings added: ${addedRows}, updated: ${updatedRows}.`,
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
