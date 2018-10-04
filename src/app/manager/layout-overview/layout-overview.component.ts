import { Component, ViewChild, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../managerFunctions';
import { Building, Layout, Unit } from '../../_models';
import { ApiFunctions } from '../apiFunctions';
import { Vector2, ShapeUtils } from 'three-full/builds/Three.es.js';
import { CellRender } from '../cellRender';
import { ColumnDefinitions } from '../columnDefinitions';
import { EditorConstants } from '../EditorConstants';
import {
  convertFileToWorkbook,
  exportOptions,
  exportSelectedOptions,
  getRows,
  showInfoExcel,
} from '../excel';
import { OverlayService, NavigationService } from '../../_services';
import { environment } from '../../../environments/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';

const urlGeoreference = environment.urlGeoreference;

export const COOR_X = 0;
export const COOR_Y = 1;

@Component({
  selector: 'app-floorplan-overview',
  templateUrl: './layout-overview.component.html',
  styleUrls: ['./layout-overview.component.scss'],
})
export class LayoutOverviewComponent implements OnInit, OnDestroy {
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

  columnDefs;

  /**
   * Local vairables
   */
  @ViewChild('importFile') importField: ElementRef;
  filtersHuman;

  buildingsArray;
  layoutsArray;
  unitsArray;

  currentProfile;
  /**
   * Subscriptions
   */
  fragment_sub: Subscription;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private infoDialog: OverlayService,
    private navigationService: NavigationService
  ) {
    navigationService.profile$.subscribe(newProfile => {
      this.currentProfile = newProfile;
      this.initComponent();
    });
  }

  sourceForm = new FormGroup({
    floor: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(200)]),
    sourceUrl: new FormControl('', Validators.required),
  });

  previousSources = false;

  get floor() {
    return this.sourceForm.get('floor');
  }
  get sourceUrl() {
    return this.sourceForm.get('sourceUrl');
  }

  /**
   * In order to provide dropdowns with site units we need to build it after load.
   * @param units
   */
  buildColumDefinitions(units) {
    let analysisColumns = [];
    if (this.currentProfile === 'analyst' || this.currentProfile === 'data') {
      const columnWidthArea = 120;
      const columnWidthNumber = 95;
      analysisColumns = [
        {
          headerName: 'Model Analysis (Areas)',
          children: [
            {
              headerName: 'Total area',
              field: 'total_area',
              cellRenderer: CellRender.areaInfoTotal,
              width: columnWidthArea,
              editable: false,
              cellClass: 'readOnly right',
            },
            {
              headerName: 'Rooms',
              field: 'room',
              columnGroupShow: 'open',
              cellRenderer: CellRender.areaInfo,
              width: columnWidthArea,
              editable: false,
              cellClass: 'readOnly right',
            },
            {
              headerName: 'Corridors',
              field: 'corridor',
              columnGroupShow: 'open',
              cellRenderer: CellRender.areaInfo,
              width: columnWidthArea,
              editable: false,
              cellClass: 'readOnly right',
            },
            {
              headerName: 'Bathrooms',
              field: 'bathroom',
              columnGroupShow: 'open',
              cellRenderer: CellRender.areaInfo,
              width: columnWidthArea,
              editable: false,
              cellClass: 'readOnly right',
            },
            {
              headerName: 'Kitchens',
              field: 'kitchen',
              columnGroupShow: 'open',
              cellRenderer: CellRender.areaInfo,
              width: columnWidthArea,
              editable: false,
              cellClass: 'readOnly right',
            },
            {
              headerName: 'Balconies',
              field: 'balcony',
              columnGroupShow: 'open',
              cellRenderer: CellRender.areaInfo,
              width: columnWidthArea,
              editable: false,
              cellClass: 'readOnly right',
            },
            {
              headerName: 'Storerooms',
              field: 'storeroom',
              columnGroupShow: 'open',
              cellRenderer: CellRender.areaInfo,
              width: columnWidthArea,
              editable: false,
              cellClass: 'readOnly right',
            },
            {
              headerName: 'Other areas',
              field: 'notDefined',
              columnGroupShow: 'open',
              cellRenderer: CellRender.areaInfo,
              width: columnWidthArea,
              editable: false,
              cellClass: 'readOnly right',
            },
          ],
        },
        /**
        {
          headerName: 'Model Analysis (Furniture)',
          children: [
            {
              headerName: 'Desks',
              field: 'num_desks',
              columnGroupShow: 'open',
              width: columnWidthNumber,
              editable: false,
              cellClass: 'readOnly right',
            },
            {
              headerName: 'Seats',
              field: 'num_seats',
              columnGroupShow: 'open',
              width: columnWidthNumber,
              editable: false,
              cellClass: 'readOnly right',
            },
            {
              headerName: 'Doors',
              field: 'num_doors',
              columnGroupShow: 'open',
              width: columnWidthNumber,
              editable: false,
              cellClass: 'readOnly right',
            },
            {
              headerName: 'Sinks',
              field: 'num_sink',
              columnGroupShow: 'open',
              width: columnWidthNumber,
              editable: false,
              cellClass: 'readOnly right',
            },
            {
              headerName: 'Toilets',
              field: 'num_toilet',
              columnGroupShow: 'open',
              width: columnWidthNumber,
              editable: false,
              cellClass: 'readOnly right',
            },
            {
              headerName: 'Railings',
              field: 'num_railing',
              columnGroupShow: 'open',
              width: columnWidthNumber,
              editable: false,
              cellClass: 'readOnly right',
            },
            {
              headerName: 'Stairs',
              field: 'num_stairs',
              columnGroupShow: 'open',
              width: columnWidthNumber,
              editable: false,
              cellClass: 'readOnly right',
            },
            {
              headerName: 'Kitchens',
              field: 'num_kitchens',
              columnGroupShow: 'open',
              width: columnWidthNumber,
              editable: false,
              cellClass: 'readOnly right',
            },
            {
              headerName: 'Windows Exterior',
              field: 'num_windowExterior',
              width: 165,
              editable: false,
              cellClass: 'readOnly right',
            },
            {
              headerName: 'Windows Interior',
              field: 'num_windowInterior',
              columnGroupShow: 'open',
              width: 155,
              editable: false,
              cellClass: 'readOnly right',
            },
          ],

        },
         */
      ];
    }

    this.columnDefs = [
      {
        headerName: 'Building',
        headerTooltip:
          'Parent building (Read only, calculated from the parent unit) main properties',
        children: [
          {
            headerName: 'Building Id',
            field: 'building_id',
            hide: this.currentProfile !== 'developer',
            width: 285,
            cellRenderer: 'linkRenderer',
            cellRendererParams: {
              type: 'viewBuilding',
            },
            cellClass: 'readOnly',
          },
          {
            headerName: 'Building Name',
            field: 'building_name',
            cellClass: 'readOnly',
            editable: false,
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
        ],
      },
      {
        headerName: 'Unit',
        headerTooltip: 'Parent unit main properties',
        children: [
          {
            headerName: 'Unit Id',
            field: 'unit_id',
            width: 285,
            cellRenderer: 'linkRenderer',
            cellRendererParams: {
              type: 'viewUnit',
            },
            cellEditor: 'agPopupSelectCellEditor',
            valueFormatter: CellRender.unitFormatter.bind(this, this.currentProfile),
            cellEditorParams: {
              values: ['', ...units.map(unit => unit.unit_id)],
            },
            editable: true,
          },
          {
            headerName: 'Unit Name',
            field: 'unit_name',
            columnGroupShow: 'open',
            cellClass: 'readOnly',
            editable: false,
          },
        ],
      },
      {
        headerName: 'Layout',
        headerTooltip: 'Layout entity main properties',
        openByDefault: true,
        children: [
          {
            headerName: 'Layout Id',
            field: 'layout_id',
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
        headerName: 'Model',
        children: [
          /**
          {
            headerName: 'FloorPlan',
            field: 'floorPlan',
            cellRenderer: CellRender.cellPdfDownloadLink,
            editable: false,
            cellClass: 'readOnly',
          },
           */
          {
            headerName: 'Floors',
            field: 'floors',
            cellRenderer: CellRender.viewFloors,
            editable: false,
            cellClass: 'readOnly',
          },
          /**
          {
            headerName: '3d model',
            field: 'model_structure',
            cellRenderer: CellRender.viewModel,
            editable: false,
            cellClass: 'readOnly',
          },
           */
        ],
      },
      ...analysisColumns,
      {
        headerName: 'Georeference',
        children: [
          {
            headerName: 'Movements',
            field: 'movements',
            cellRenderer: 'georeferenceRenderer',
            cellRendererParams: { type: 'layout' },
            editable: true,
          },
        ],
      },
      {
        headerName: 'Simulations',
        children: [
          {
            headerName: 'View',
            field: 'simulation_statuses.view.status',
            cellRenderer: 'simulationLayoutRenderer',
            cellStyle: { padding: '0px' },
            width: 200,
            editable: false,
            cellClass: 'readOnly',
          },
          /** Simulations
          {
            headerName: 'Wbs',
            field: 'simulation_statuses.wbs.status',
            columnGroupShow: 'open',
            cellRenderer: 'simulationLayoutRenderer',
            cellStyle: { padding: '0px' },
            width: 200,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Pathways',
            field: 'simulation_statuses.pathways.status',
            columnGroupShow: 'open',
            cellRenderer: 'simulationLayoutRenderer',
            cellStyle: { padding: '0px' },
            width: 200,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Basic features',
            field: 'simulation_statuses.basic_features.status',
            columnGroupShow: 'open',
            cellRenderer: 'simulationLayoutRenderer',
            cellStyle: { padding: '0px' },
            width: 200,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Accoustics',
            field: 'simulation_statuses.accoustics.status',
            columnGroupShow: 'open',
            cellRenderer: 'simulationLayoutRenderer',
            cellStyle: { padding: '0px' },
            width: 200,
            editable: false,
            cellClass: 'readOnly',
          },
           */
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

  changeSource(clear) {
    const node = this.selectedNodes[0];
    let newValue;

    if (clear) {
      newValue = {
        floors: [],
        model_structure: {},
      };

      node.data.model_structure = '';
      node.data.movements = [];
    } else {
      const floor = document.getElementById('floor');
      const sourceUrl = document.getElementById('sourceUrl');

      if (floor['value'] && sourceUrl['value']) {
        const floorVal = parseInt(floor['value'], 10);
        const sourceUrlVal = sourceUrl['value'];

        this.sourceForm.get('floor').setValue(floorVal + 1);
        this.sourceForm.get('sourceUrl').setValue('');

        const previousFloors = node.data.floors ? node.data.floors : [];

        // We avoid repeated floors
        const newPrevFloors = previousFloors.filter(
          prev => parseInt(prev.floor_nr, 10) !== floorVal
        );

        newPrevFloors.push({
          floor_nr: floorVal,
          source: sourceUrlVal,
        });

        newValue = {
          floors: newPrevFloors,
        };

        node.data.model_structure = 'Loading';
      } else {
        console.error('Null source');
      }
    }

    /**
     * When changing the floors, model structure gets loading
     */

    this.gridApi.updateRowData({
      update: [node.data],
    });

    const layout_id = node.data.layout_id;
    const url = 'layouts/' + layout_id;

    ManagerFunctions.patchElement(
      this.http,
      this.selectedNodes[0],
      url,
      newValue,
      this.gridOptions.api,
      this.layoutReactionToEdit.bind(this),
      ManagerFunctions.showErroruser
    );
  }

  addRow() {
    const newLayout = {
      name: '',
      description: '',
      images: '',
      movements: [],
      floors: [],
    };

    ApiFunctions.post(
      this.http,
      'layouts',
      newLayout,
      layouts => {
        this.gridOptions.api.updateRowData({
          add: [layouts],
        });

        // We move to the last page. (After adding, because can be in a new page)
        this.gridOptions.api.paginationGoToLastPage();
      },
      ManagerFunctions.showErroruser
    );
  }

  setLayoutBuildingData(layout) {
    if (layout.unit_id || layout.unit_id === '') {
      const unit = this.unitsArray.find(unit => unit.unit_id === layout.unit_id);
      if (unit) {
        layout['unit'] = unit;

        layout['building_id'] = unit.building_id;
        layout['unit_name'] = unit.name ? unit.name : '';

        const building = this.buildingsArray.find(
          building => building.building_id === unit.building_id
        );

        layout['building_referenced'] = building && ManagerFunctions.isReferencedBuilding(building);

        // Has to be a building with that id and has to be georeferenced
        layout['building_referenced_osm'] =
          building && ManagerFunctions.isReferencedOSMBuilding(building);
        layout['building_referenced_st'] =
          building && ManagerFunctions.isReferencedSTBuilding(building);

        layout['building_name'] = building && building.name ? building.name : '';
        layout['building'] = building;
      } else {
        layout['building'] = {};
        layout['building_id'] = '';
        layout['building_name'] = '';
        layout['building_referenced_osm'] = false;
        layout['building_referenced_st'] = false;
        layout['building_referenced'] = false;

        layout['unit'] = {};
        layout['unit_name'] = '';
      }
    } else {
      layout['building'] = {};
      layout['building_id'] = '';
      layout['building_name'] = '';
      layout['building_referenced_osm'] = false;
      layout['building_referenced_st'] = false;

      layout['unit'] = {};
      layout['unit_name'] = '';
    }
  }

  /**
   * Starts the recursive analysis of a model structure from a layout.
   * Stores the data in the layout itself
   * @param layout
   */
  analyzeModelStructure(layout) {
    const model = layout['model_structure'];
    const analysis = {
      notDefined: [],
      room: [],
      kitchen: [],
      bathroom: [],
      corridor: [],
      balcony: [],
      storeroom: [],

      /** num Elements */
      num_seats: 0,
      num_desks: 0,
      num_doors: 0,
      num_sink: 0,
      num_toilet: 0,
      num_railing: 0,
      num_stairs: 0,
      num_kitchens: 0,
      num_windowExterior: 0,
      num_windowInterior: 0,
    };

    if (model && model.floors) {
      model.floors.forEach(floor => {
        this.analyzeModelStructureRecursive(floor.children, analysis);
      });
    }

    layout['total_area'] = [
      ...analysis.notDefined,
      ...analysis.room,
      ...analysis.kitchen,
      ...analysis.bathroom,
      ...analysis.corridor,
      ...analysis.balcony,
      ...analysis.storeroom,
    ];
    layout['notDefined'] = analysis.notDefined;
    layout['room'] = analysis.room;
    layout['kitchen'] = analysis.kitchen;
    layout['bathroom'] = analysis.bathroom;
    layout['corridor'] = analysis.corridor;
    layout['balcony'] = analysis.balcony;
    layout['storeroom'] = analysis.storeroom;

    /** num Elements */
    layout['num_seats'] = analysis.num_seats;
    layout['num_desks'] = analysis.num_desks;
    layout['num_doors'] = analysis.num_doors;
    layout['num_sink'] = analysis.num_sink;
    layout['num_toilet'] = analysis.num_toilet;
    layout['num_railing'] = analysis.num_railing;
    layout['num_stairs'] = analysis.num_stairs;
    layout['num_kitchens'] = analysis.num_kitchens;
    layout['num_windowExterior'] = analysis.num_windowExterior;
    layout['num_windowInterior'] = analysis.num_windowInterior;
  }

  analyzeModelStructureRecursive(elements, analysis) {
    if (elements) {
      elements.forEach(element => {
        if (
          element.type === EditorConstants.AREA_KITCHEN ||
          element.type === EditorConstants.AREA_KITCHEN_DINING
        ) {
          analysis.kitchen.push(this.calculateArea(element));
        } else if (element.type === EditorConstants.BATHROOM) {
          analysis.bathroom.push(this.calculateArea(element));
        } else if (
          element.type === EditorConstants.AREA_NOT_DEFINED ||
          element.type === EditorConstants.SHAFT
        ) {
          analysis.notDefined.push(this.calculateArea(element));
        } else if (element.type === EditorConstants.BALCONY) {
          analysis.balcony.push(this.calculateArea(element));
        } else if (element.type === EditorConstants.CORRIDOR) {
          analysis.corridor.push(this.calculateArea(element));
        } else if (element.type === EditorConstants.STOREROOM) {
          analysis.storeroom.push(this.calculateArea(element));
        } else if (
          element.type === EditorConstants.ROOM ||
          element.type === EditorConstants.DINING
        ) {
          analysis.room.push(this.calculateArea(element));
        } else if (element.type === EditorConstants.TOILET) {
          analysis.num_toilet += 1;
        } else if (element.type === EditorConstants.STAIRS) {
          analysis.num_stairs += 1;
        } else if (element.type === EditorConstants.SINK) {
          analysis.num_sink += 1;
        } else if (element.type === EditorConstants.KITCHEN) {
          analysis.num_kitchens += 1;
        } else if (element.type === EditorConstants.DESK) {
          analysis.num_desks += 1;
        } else if (element.type === EditorConstants.CHAIR) {
          analysis.num_seats += 1;
        } else if (
          element.type === EditorConstants.OFFICE_MISC ||
          element.type === EditorConstants.MISC
        ) {
        } else if (element.type === EditorConstants.DOOR) {
          analysis.num_doors += 1;
        } else if (element.type === EditorConstants.WINDOW_ENVELOPE) {
          analysis.num_windowExterior += 1;
        } else if (element.type === EditorConstants.WINDOW_INTERIOR) {
          analysis.num_windowInterior += 1;
        } else if (element.type === EditorConstants.ENVELOPE) {
        } else if (element.type === EditorConstants.RAILING) {
          analysis.num_railing += 1;
        } else if (element.type === EditorConstants.SPACE_NOT_DEFINED) {
        } else if (element.type === EditorConstants.SEPARATOR_NOT_DEFINED) {
        } else {
          console.error('Unknown', element.type);
        }

        this.analyzeModelStructureRecursive(element.children, analysis);
      });
    }
  }

  /**
   * Given an element from the model structure calculates the area in m2
   * @param element
   */
  calculateArea(element) {
    const currentArray = element.footprint.coordinates[0];
    const currentArrayVector = currentArray.map(coor => new Vector2(coor[COOR_X], coor[COOR_Y]));
    return Math.abs(ShapeUtils.area(currentArrayVector));
  }

  ngOnInit() {}

  initComponent() {
    /** LAYOUTS */

    this.loading = true;
    this.filterModelSet = false;

    ManagerFunctions.requestAllData(
      this.http,
      (sitesArray, buildingsArray, unitsArray, layoutsArray) => {
        this.loading = false;

        this.buildingsArray = buildingsArray;
        this.unitsArray = unitsArray;
        this.layoutsArray = layoutsArray;

        this.layoutsArray.forEach(layout => {
          this.setLayoutBuildingData(layout);
          this.analyzeModelStructure(layout);
        });

        this.buildColumDefinitions(unitsArray);

        this.gridOptions = {
          // <GridOptions>
          rowData: this.layoutsArray,
          columnDefs: this.columnDefs,

          /** Pagination */
          ...ColumnDefinitions.pagination,
          ...ColumnDefinitions.columnOptions,

          getRowNodeId: data => data.layout_id,
          onCellValueChanged: params => {
            ManagerFunctions.reactToEdit(
              this.http,
              params,
              'layout_id',
              'layouts',
              this.gridOptions.api,
              this.layoutReactionToEdit.bind(this)
            );
          },

          onFilterChanged: params => {
            const model = params.api.getFilterModel();
            this.filterModelSet = model !== null && Object.keys(model).length > 0;
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

              if (this.selectedRows && this.selectedRows.length === 1) {
                console.log('this.selectedRows', this.selectedRows[0]);

                const floors = this.selectedRows[0].floors;
                this.previousSources = floors && floors.length > 0;
              }
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
   * After editing, we need to react to the new values.
   * New model structure -> new analisis
   * New unit -> New building information
   */
  layoutReactionToEdit(nodeData, element) {
    // if the new Layout has model_structure we update it.
    if (element.model_structure) {
      nodeData['model_structure'] = element.model_structure;
      this.analyzeModelStructure(nodeData);
    }

    if (element.floors) {
      nodeData['floors'] = element.floors;
    }

    // if the new Layout has new unit id, we update the building data.
    if (element.unit_id || element.unit_id === '') {
      this.setLayoutBuildingData(nodeData);
    }
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
      delete newRow['layout_id'];

      delete newRow['unit'];
      delete newRow['unit_name'];

      delete newRow['simulation_statuses'];

      delete newRow['building'];
      delete newRow['building_name'];
      delete newRow['building_referenced_osm'];
      delete newRow['building_referenced_st'];
      delete newRow['building_referenced'];

      delete newRow['building_id'];
      delete newRow['total_area'];
      delete newRow['notDefined'];
      delete newRow['room'];
      delete newRow['kitchen'];
      delete newRow['bathroom'];
      delete newRow['corridor'];
      delete newRow['balcony'];
      delete newRow['storeroom'];

      delete newRow['num_seats'];
      delete newRow['num_desks'];
      delete newRow['num_doors'];
      delete newRow['num_sink'];
      delete newRow['num_toilet'];
      delete newRow['num_railing'];
      delete newRow['num_stairs'];
      delete newRow['num_kitchens'];
      delete newRow['num_windowExterior'];
      delete newRow['num_windowInterior'];

      // Control fields are not duplicated
      delete newRow['org_id'];
      delete newRow['user_id'];
      delete newRow['updated'];
      delete newRow['created'];

      if (newRow['unit_id'] && (newRow['unit_id'] === '' || newRow['unit_id'] === 'None')) {
        delete newRow['unit_id'];
      }

      ApiFunctions.post(
        this.http,
        'layouts',
        newRow,
        layout => {
          // We populate the calculated fields
          this.layoutReactionToEdit(layout, layout);

          // We update the data in the table
          this.gridOptions.api.updateRowData({
            add: [layout],
          });

          // We move to the last page. (After adding, because can be in a new page)
          this.gridOptions.api.paginationGoToLastPage();
        },
        ManagerFunctions.showErroruser
      );
    });
  }

  /**
   * Deletes the selected rows in the API
   */
  delete() {
    ManagerFunctions.reactToDelete(
      this.http,
      this.selectedRows,
      this.gridOptions.api,
      'layout',
      'layouts',
      'layout_id',
      'layouts',
      null
    );
  }

  /**
   * Select the nodes (rows) that are not Georeferenced
   */
  selectNotGeoreferenced() {
    this.gridOptions.api.selectAll();
    const nodes = this.gridOptions.api.getSelectedNodes();
    nodes.forEach(node => {
      if (!node.data.building_referenced || ManagerFunctions.isReferencedLayout(node.data)) {
        node.setSelected(false);
      }
    });
  }

  /**
   * Select the nodes (rows) that are not Digitalized
   */
  selectNotDigitalized() {
    this.gridOptions.api.selectAll();
    const nodes = this.gridOptions.api.getSelectedNodes();
    nodes.forEach(node => {
      if (ManagerFunctions.isDigitalizedLayout(node.data)) {
        node.setSelected(false);
      }
    });
  }

  georeferenceAuto() {
    const nodes = this.gridOptions.api.getSelectedNodes();
    nodes.forEach(node => {
      if (
        ManagerFunctions.isDigitalizedLayout(node.data) &&
        node.data.unit_id &&
        node.data.building_id &&
        !(node.data.movements && node.data.movements.length > 0)
      ) {
        ApiFunctions.get(
          this.http,
          'layouts/' + node.data.layout_id + '/georef_proposals',
          surroundings => {
            console.log(node.data.layout_id, surroundings);
            if (
              typeof surroundings['movements'] !== 'undefined' &&
              surroundings['movements'] !== null &&
              surroundings['movements'].length > 0
            ) {
              console.log(node.data.layout_id, surroundings['movements'][0]);

              ApiFunctions.patch(
                this.http,
                'layouts/' + node.data.layout_id,
                {
                  movements: [
                    {
                      source: 'swiss_topo',
                      ...surroundings['movements'][0],
                    },
                  ],
                },
                element => {
                  console.log('Element ', element);
                },
                error => {
                  console.error(error);
                }
              );
            } else {
              console.error('surroundings not found');
            }
          },
          error => {
            console.error(error);
          }
        );
      }
    });
  }

  georeferenceOSM() {
    this.georeference('open_street_maps');
  }

  georeference(src) {
    const nodes = this.gridOptions.api.getSelectedNodes();

    if (nodes.length === 1) {
      const node = nodes[0];

      const layout_id = node.data.layout_id;

      if (!ManagerFunctions.isDigitalizedLayout(node.data)) {
        ManagerFunctions.showWarning(
          'Layout with no 3d model',
          `The layout has not been digitalized, a 3d model is required before georeferencing.`,
          'Ok',
          confirmed => {}
        );
        return false;
      }

      if (!node.data.unit_id || !node.data.building_id) {
        ManagerFunctions.showWarning(
          'Layout not linked to a unit that belongs to a building with address',
          `The layout has not valid building with address, a georeferenced building is required before layout georeferencing.`,
          `Ok`,
          confirmed => {}
        );
        return false;
      }

      const unit_found = this.unitsArray.find(unit => unit.unit_id === node.data.unit_id);
      const building_found = this.buildingsArray.find(
        building => building.building_id === unit_found.building_id
      );

      if (!ManagerFunctions.isReferencedBuilding(building_found)) {
        ManagerFunctions.showWarning(
          'Layout not linked to a unit that belongs to a georeferenced building',
          `The layout has not valid georeferenced building, a georeferenced building is required before layout georeferencing.`,
          'Ok',
          confirmed => {}
        );
        return false;
      }

      ManagerFunctions.openLink(
        urlGeoreference + '/building/' + layout_id + (src ? `#source=${src}` : '')
      );
    } else if (nodes.length > 1) {
      const layouts_data = nodes.map(node => {
        const layout = node.data;
        const layout_id_found = layout.layout_id;

        const model_structure_found = ManagerFunctions.isDigitalizedLayout(layout);
        let unit_found = null;
        let unit_id_found = null;
        let building_found = null;
        let building_id_found = null;
        let building_referenced_found = null;

        if (layout.unit_id || layout.unit_id === '') {
          unit_id_found = layout.unit_id;
          unit_found = this.unitsArray.find(unit => unit.unit_id === unit_id_found);
          if (unit_found) {
            building_id_found = unit_found.building_id;
            building_found = this.buildingsArray.find(
              building => building.building_id === unit_found.building_id
            );

            // Has to be a building with that id and has to be georeferenced
            building_referenced_found =
              building_found && ManagerFunctions.isReferencedBuilding(building_found);
          } else {
            building_referenced_found = false;
          }
        } else {
          building_referenced_found = false;
        }

        return {
          has_model_structure: model_structure_found,
          layout_id: layout_id_found,
          unit: unit_found,
          unit_id: unit_id_found,
          building: building_found,
          building_id: building_id_found,
          building_referenced: building_referenced_found,
        };
      });

      console.log('layouts_data', layouts_data);

      const list = layouts_data
        .map(layout_data => {
          if (layout_data.has_model_structure && layout_data.building_id) {
            if (layout_data.building_referenced) {
              return `\t${layout_data.layout_id}\n`;
            }
            return `${layout_data.building_id}\t${layout_data.layout_id}\n`;
          }
          return ``;
        })
        .join('');

      const withoutMS = layouts_data.reduce(
        (accumulator, layout_data) =>
          layout_data.has_model_structure ? accumulator : accumulator + 1,
        0
      );
      const withNoAdress = layouts_data.reduce(
        (accumulator, layout_data) =>
          layout_data.building_referenced_osm || layout_data.building_referenced_st
            ? accumulator
            : accumulator + 1,
        0
      );

      if (withoutMS > 0) {
        ManagerFunctions.showWarning(
          'Layouts with no 3d model',
          withoutMS === 1
            ? `There is a layout in your selection that has not been digitalized.`
            : `There are ${withoutMS} layouts in your selection that have not been digitalized.`,
          `Continue anyway`,
          confirmed => {
            if (confirmed) {
              this.georeferenceConfirmedModelStructure(withNoAdress, list, src);
            }
          }
        );
      } else {
        this.georeferenceConfirmedModelStructure(withNoAdress, list, src);
      }
    }
  }

  georeferenceConfirmedModelStructure(withNoAdress, list, src) {
    if (withNoAdress > 0) {
      ManagerFunctions.showWarning(
        'Layouts not linked to a unit that belongs to a georeferenced building',
        withNoAdress === 1
          ? `There is a layout in your selection that has not valid georeferenced building.`
          : `There are ${withNoAdress} layouts in your selection that have not valid georeferenced buildings.`,
        `Continue anyway`,
        confirmed => {
          if (confirmed) {
            ManagerFunctions.openLink(
              urlGeoreference + '/multiple#list=' + list + '' + (src ? `&source=${src}` : '')
            );
          }
        }
      );
    } else {
      ManagerFunctions.openLink(
        urlGeoreference + '/multiple#list=' + list + '' + (src ? `&source=${src}` : '')
      );
    }
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
   * startSimulations
   */

  getSimulationStatus() {
    const nodes = this.gridOptions.api.getSelectedNodes();
    const layouts = nodes.map(node => node.data);
    layouts.forEach(layout => {
      console.log('get layout simulation status for ', layout.layout_id);
      ManagerFunctions.requestLayoutSimulationsStatus(this.http, layout, this.gridOptions.api);
    });
  }

  startSimulations() {
    const nodes = this.gridOptions.api.getSelectedNodes();
    const layouts = nodes.map(node => node.data);
    const simulations = [
      {
        name: 'view',
      },
    ]; // 'view', 'wbs', 'pathways', 'basic_features', 'accoustics'

    layouts.forEach(layout => {
      ManagerFunctions.requestLayoutSimulations(
        this.http,
        layout,
        simulations,
        this.gridOptions.api
      );
    });
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
        const dictionaryLayouts = {};

        dictionaryLayouts['Unit Id'] = 'unit_id';
        dictionaryLayouts['Layout Id'] = 'layout_id';
        dictionaryLayouts['Name'] = 'name';
        dictionaryLayouts['Description'] = 'description';

        dictionaryLayouts['Movements'] = 'movements';

        // Model structure is not imported.
        // dictionaryLayouts['Model structure'] = 'model_structure';

        const allRows = getRows(result, dictionaryLayouts);

        console.log('allRows', allRows);

        let addedRows = 0;
        let updatedRows = 0;

        allRows.forEach(oneRow => {
          if (oneRow.layout_id && oneRow.layout_id !== null && oneRow.layout_id !== '') {
            const layout_id = oneRow.layout_id;
            delete oneRow.layout_id;
            updatedRows += 1;
            ApiFunctions.patch(
              this.http,
              'layouts/' + layout_id,
              oneRow,
              layout => {
                const node = this.gridOptions.api.getRowNode(layout_id);
                this.layoutReactionToEdit(layout, layout);
                node.setData(layout);
              },
              ManagerFunctions.showErrorUserNoReload
            );
          } else {
            addedRows += 1;

            // We never send the layout id, even when is ''
            delete oneRow.layout_id;

            ApiFunctions.post(
              this.http,
              'layouts',
              oneRow,
              layout => {
                this.layoutReactionToEdit(layout, layout);

                this.gridOptions.api.updateRowData({
                  add: [layout],
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
          `Layouts added: ${addedRows}, updated: ${updatedRows}.`,
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
