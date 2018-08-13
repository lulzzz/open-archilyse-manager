import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../managerFunctions';
import { Building, Layout, Unit } from '../../_models';
import { ApiFunctions } from '../apiFunctions';
import { urlGeoreference } from '../url';
import { Vector2, ShapeUtils } from 'three-full/builds/Three.es.js';
import { CellRender } from '../cellRender';
import { ColumnDefinitions } from '../columnDefinitions';

export const COOR_X = 0;
export const COOR_Y = 1;

@Component({
  selector: 'app-floorplan-overview',
  templateUrl: './layout-overview.component.html',
  styleUrls: ['./layout-overview.component.scss'],
})
export class LayoutOverviewComponent implements OnInit, OnDestroy {
  /**
   * TABLE DOCUMENTATION
   * https://www.ag-grid.com/angular-getting-started/
   */
  generalError = null;
  loading = true;

  selectedNodes = [];
  selectedRows = [];

  buildingsArray;
  layoutsArray;
  unitsArray;

  gridApi;
  gridColumnApi;

  filterModelSet = false;

  gridOptions;

  fragment_sub: Subscription;

  columnDefs;

  buildColumDefinitions(layouts, units, buildings) {
    this.columnDefs = [
      {
        headerName: 'Building',
        children: [
          {
            headerName: 'Id',
            field: 'building_id',
            width: 230,
            cellRenderer: CellRender.viewBuilding,
            cellEditor: 'agPopupSelectCellEditor',
            cellEditorParams: {
              values: buildings.map(building => building.building_id),
            },
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Georeferenced',
            field: 'building_referenced',
            cellRenderer: 'checkboxRenderer',
            width: 100,
            cellRendererParams: { editable: false },
            cellClass: 'readOnly',
          },
        ],
      },
      {
        headerName: 'Unit',
        children: [
          {
            headerName: 'Id',
            field: 'unit_id',
            width: 230,
            cellRenderer: CellRender.viewUnit,
            cellEditor: 'agPopupSelectCellEditor',
            cellEditorParams: {
              values: units.map(unit => unit.unit_id),
            },
            editable: true,
          },
        ],
      },
      {
        headerName: 'Layout',
        children: [
          {
            headerName: 'Id',
            field: 'layout_id',
            width: 190,
            editable: false,
            cellClass: 'idCell',
          },
          { headerName: 'Name', field: 'name', editable: true },
          { headerName: 'Description', field: 'description', editable: true },
        ],
      },
      {
        headerName: 'Images',
        children: [
          {
            headerName: 'Images',
            field: 'images',
            cellRenderer: CellRender.viewImg,
            editable: true,
          },
        ],
      },
      {
        headerName: 'Model',
        children: [
          {
            headerName: 'FloorPlan',
            field: 'floorPlan',
            cellRenderer: CellRender.cellPdfDownloadLink,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Floors',
            field: 'floors',
            cellRenderer: CellRender.viewFloors,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Model_structure',
            field: 'model_structure',
            cellRenderer: CellRender.viewModel,
            editable: false,
            cellClass: 'readOnly',
          },
        ],
      },
      {
        headerName: 'Model Analisys',
        children: [
          {
            headerName: 'Total area',
            field: 'total_area',
            cellRenderer: CellRender.areaInfoTotal,
            width: 100,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Rooms',
            field: 'room',
            cellRenderer: CellRender.areaInfo,
            width: 100,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Corridors',
            field: 'corridor',
            cellRenderer: CellRender.areaInfo,
            width: 100,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Bathrooms',
            field: 'bathroom',
            cellRenderer: CellRender.areaInfo,
            width: 100,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Kitchens',
            field: 'kitchen',
            cellRenderer: CellRender.areaInfo,
            width: 100,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Balconies',
            field: 'balcony',
            cellRenderer: CellRender.areaInfo,
            width: 100,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Storerooms',
            field: 'storeroom',
            cellRenderer: CellRender.areaInfo,
            width: 100,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Other areas',
            field: 'notDefined',
            cellRenderer: CellRender.areaInfo,
            width: 100,
            editable: false,
            cellClass: 'readOnly',
          },
        ],
      },
      {
        headerName: 'Georeference',
        children: [
          {
            headerName: 'Movements',
            field: 'movements',
            cellRenderer: CellRender.viewMovement,
            editable: true,
          },
        ],
      },
      {
        headerName: 'Simulations',
        children: [
          {
            headerName: 'View',
            field: 'simulations.view',
            cellRenderer: CellRender.viewSimulation,
            width: 100,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Wbs',
            field: 'simulations.wbs',
            cellRenderer: CellRender.viewSimulation,
            width: 100,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Pathways',
            field: 'simulations.pathways',
            width: 100,
            cellRenderer: CellRender.viewSimulation,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Basic features',
            field: 'simulations.basic_features',
            width: 100,
            cellRenderer: CellRender.viewSimulation,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Accoustics',
            field: 'simulations.accoustics',
            width: 100,
            cellRenderer: CellRender.viewSimulation,
            editable: false,
            cellClass: 'readOnly',
          },
        ],
      },

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
    } else {
      const floor = document.getElementById('floor');
      const sourceUrl = document.getElementById('sourceUrl');

      if (floor['value'] && sourceUrl['value']) {
        const floorVal = floor['value'];
        const sourceUrlVal = sourceUrl['value'];

        const previousFloors = node.data.floors ? node.data.floors : [];

        console.log('previousFloors', previousFloors);

        previousFloors.push({
          floor_nr: floorVal,
          source: sourceUrlVal,
        });

        newValue = {
          floors: previousFloors,
        };
      } else {
        console.error('Null source');
      }
    }

    /**
     * When changing the floors, model structure gets loading
     */
    node.data.model_structure = 'Loading';
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
    ApiFunctions.post(
      this.http,
      'layouts',
      {
        name: '',
        description: '',
        images: '',
        movements: [],
        floors: [],
      },
      layouts => {
        console.log('layouts', layouts);

        this.gridOptions.api.updateRowData({
          add: [layouts],
        });
      },
      ManagerFunctions.showErroruser
    );
  }

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  setLayoutBuildingData(layout) {
    layout['building_referenced'] = false;
    if (layout.unit_id) {
      const unit = this.unitsArray.find(unit => unit.unit_id === layout.unit_id);
      if (unit) {
        layout['building_id'] = unit.building_id;
        const building = this.buildingsArray.find(
          building => building.building_id === unit.building_id
        );
        if (building) {
          layout['building_referenced'] = ManagerFunctions.isReferencedBuilding(building);
        }
      }
    }
  }

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
  }
  calculateArea(element) {
    const currentArray = element.footprint.coordinates[0];
    const currentArrayVector = currentArray.map(coor => new Vector2(coor[COOR_X], coor[COOR_Y]));
    return Math.abs(ShapeUtils.area(currentArrayVector));
  }
  analyzeModelStructureRecursive(elements, analysis) {
    if (elements) {
      elements.forEach(element => {
        if (element.type === 'AreaType.KITCHEN' || element.type === 'AreaType.KITCHEN_DINING') {
          analysis.kitchen.push(this.calculateArea(element));
        } else if (element.type === 'AreaType.BATHROOM') {
          analysis.bathroom.push(this.calculateArea(element));
        } else if (element.type === 'AreaType.NOT_DEFINED' || element.type === 'AreaType.SHAFT') {
          analysis.notDefined.push(this.calculateArea(element));
        } else if (element.type === 'AreaType.BALCONY') {
          analysis.balcony.push(this.calculateArea(element));
        } else if (element.type === 'AreaType.CORRIDOR') {
          analysis.corridor.push(this.calculateArea(element));
        } else if (element.type === 'AreaType.STOREROOM') {
          analysis.storeroom.push(this.calculateArea(element));
        } else if (element.type === 'AreaType.ROOM' || element.type === 'AreaType.DINING') {
          analysis.room.push(this.calculateArea(element));
        } else {
          // console.log(element.type);
        }

        this.analyzeModelStructureRecursive(element.children, analysis);
      });
    }
  }

  ngOnInit() {
    /** LAYOUTS */

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

        this.buildColumDefinitions(layoutsArray, unitsArray, buildingsArray);

        this.gridOptions = <GridOptions>{
          rowData: this.layoutsArray,
          columnDefs: this.columnDefs,

          /** Pagination */
          ...ColumnDefinitions.pagination,
          ...ColumnDefinitions.columnOptions,

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
          },
          onSelectionChanged: () => {
            this.selectedNodes = this.gridOptions.api.getSelectedNodes();
            this.selectedRows = this.gridOptions.api.getSelectedRows();

            if (this.selectedRows && this.selectedRows.length === 1) {
              console.log('this.selectedRows', this.selectedRows[0]);
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
    if (element.unit_id) {
      this.setLayoutBuildingData(nodeData);
    }
  }

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

  selectNotGeoreferenced() {
    this.gridOptions.api.selectAll();
    const nodes = this.gridOptions.api.getSelectedNodes();
    nodes.forEach(node => {
      if (!node.data.building_referenced || ManagerFunctions.isReferencedLayout(node.data)) {
        node.setSelected(false);
      }
    });
  }

  selectNotDigitalized() {
    this.gridOptions.api.selectAll();
    const nodes = this.gridOptions.api.getSelectedNodes();
    nodes.forEach(node => {
      if (ManagerFunctions.isDigitalizedLayout(node.data)) {
        node.setSelected(false);
      }
    });
  }

  georeference() {
    const nodes = this.gridOptions.api.getSelectedNodes();

    if (nodes.length === 1) {
      const node = nodes[0];

      const layout_id = node.data.layout_id;
      ManagerFunctions.openNewWindow(urlGeoreference + '/building/' + layout_id);
    } else if (nodes.length > 1) {
      const layout_ids = nodes.map(node => node.data.layout_id);

      const list = layout_ids.map(layout_id => `\t` + layout_id.join + `\n`);
      ManagerFunctions.openNewWindow(urlGeoreference + '/multiple#list=' + list);
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
      console.log('get Building simulation status for ', layout.layout_id);
      ApiFunctions.get(
        this.http,
        'layouts/' + layout.layout_id + '/simulations/status',
        result => {
          console.log('result ', result);
        },
        error => {
          console.error(error);
        }
      );
    });
  }

  startSimulations() {
    const nodes = this.gridOptions.api.getSelectedNodes();
    const layout_ids = nodes.map(node => node.data.layout_id);
    layout_ids.forEach(layout_id => {
      console.log('Start Layouts simulations for ', layout_id);
      ApiFunctions.post(
        this.http,
        'layouts/' + layout_id,
        {},
        result => {
          console.log('result', result, layout_id);
        },
        ManagerFunctions.showErroruser
      );
    });
  }

  /**
   * Export functions
   */
  export() {
    this.gridOptions.api.exportDataAsCsv({
      columnSeparator: ';',
    });
  }
  exportSelected() {
    this.gridOptions.api.exportDataAsCsv({
      onlySelected: true,
      columnSeparator: ';',
    });
  }
}
