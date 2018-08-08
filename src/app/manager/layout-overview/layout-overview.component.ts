import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../managerFunctions';
import { Building, Layout, Unit } from '../../_models';
import { ApiFunctions } from '../apiFunctions';
import { urlEditor, urlGeoreference, urlPortfolio } from '../url';
import { Vector2, ShapeUtils } from 'three-full/builds/Three.es.js';

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

  selectedNodes = [];
  selectedRows = [];

  gridApi;
  gridColumnApi;

  filterModelSet = false;

  gridOptions;

  fragment_sub: Subscription;

  columnDefs;

  buildColumDefinitions(layouts, units, buildings) {
    this.columnDefs = [
      {
        headerName: 'Layout_id',
        field: 'layout_id',
        width: 190,
        editable: false,
      },
      {
        headerName: 'Unit_id',
        field: 'unit_id',
        width: 230,
        cellRenderer: this.viewUnit,
        cellEditor: 'agPopupSelectCellEditor',
        cellEditorParams: {
          values: units.map(unit => unit.unit_id),
        },
        editable: true,
      },
      {
        headerName: 'Building_id',
        field: 'building_id',
        width: 230,
        cellRenderer: this.viewBuilding,
        cellEditor: 'agPopupSelectCellEditor',
        cellEditorParams: {
          values: buildings.map(building => building.building_id),
        },
        editable: false,
      },
      {
        headerName: 'Building Georeferenced',
        field: 'building_referenced',
        cellRenderer: 'checkboxRenderer',
        width: 100,
        cellRendererParams: { editable: false },
      },
      { headerName: 'Name', field: 'name', editable: true },
      { headerName: 'Description', field: 'description', editable: true },
      {
        headerName: 'FloorPlan',
        field: 'floorPlan',
        cellRenderer: ManagerFunctions.cellPdfDownloadLink,
        editable: false,
      },
      {
        headerName: 'Source',
        field: 'source',
        cellRenderer: ManagerFunctions.viewSource,
        editable: true,
      },
      {
        headerName: 'Images',
        field: 'images',
        cellRenderer: ManagerFunctions.viewImg,
        editable: true,
      },
      {
        headerName: 'Movements',
        field: 'movements',
        cellRenderer: this.viewMovement,
        editable: true,
      },
      {
        headerName: 'Model_structure',
        field: 'model_structure',
        cellRenderer: this.viewModel,
        editable: true,
      },

      {
        headerName: 'Total area',
        field: 'total_area',
        cellRenderer: this.areaInfoTotal,
        width: 100,
        editable: false,
      },
      {
        headerName: 'Other areas',
        field: 'area',
        cellRenderer: this.areaInfo,
        width: 100,
        editable: false,
      },
      {
        headerName: 'Toilets',
        field: 'toilet',
        cellRenderer: this.areaInfo,
        width: 100,
        editable: false,
      },
      {
        headerName: 'Kitchens',
        field: 'kitchen',
        cellRenderer: this.areaInfo,
        width: 100,
        editable: false,
      },
      {
        headerName: 'Balcony',
        field: 'balcony',
        cellRenderer: this.areaInfo,
        width: 100,
        editable: false,
      },

      ...ManagerFunctions.metaUserAndData,
    ];
  }

  addRow() {
    ApiFunctions.post(
      this.http,
      'layouts',
      {
        name: '',
        description: '',
        images: '',
        model_structure: {},
        movements: [],
        source: '',
        unit_id: '',
      },
      layouts => {
        console.log('layouts', layouts);

        this.gridOptions.api.updateRowData({
          add: [layouts],
        });
      }
    );
  }

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  viewMovement(params) {
    let result = '';
    if (params.movements) {
      for (let i = 0; i < params.movements.length; i += 1) {
        const movements = params.movements[i];
        result += `<div>
            source: ${movements.source},
            angle: ${movements.angle}°,
            offset (xyz): ${movements.x_off}, ${movements.y_off}, ${movements.z_off}
            pivot (xyz): ${movements.x_pivot}, ${movements.y_pivot}, ${movements.z_pivot}
          </div>`;
      }
    }
    return result;
  }

  viewModel(params) {
    if (ManagerFunctions.isDigitalizedLayout(params.data)) {
      return `<a href='${urlEditor}/` + params.data.layout_id + `' > View model </a>`;
    } else {
      return `Not digitalized`;
    }
  }

  areaInfoTotal(params) {
    if (params.value && params.value !== '' && params.value !== 'None' && params.value.length > 0) {
      return params.value.reduce((a, b) => a + b, 0).toFixed(2) + `m<sup>2</sup> `;
    }
    return ``;
  }

  areaInfo(params) {
    if (params.value && params.value !== '' && params.value !== 'None' && params.value.length > 0) {
      if (params.value.length > 1) {
        return (
          `(${params.value.length}) ` +
          params.value.map(v => v.toFixed(2)).join(`m<sup>2</sup>, `) +
          `m<sup>2</sup> `
        );
      } else {
        return params.value[0].toFixed(2) + `m<sup>2</sup> `;
      }
    }
    return ``;
  }

  viewUnit(params) {
    if (params.value && params.value !== '' && params.value !== 'None') {
      return (
        params.value + ` <a href='${urlPortfolio}/unit#unit_id=` + params.value + `' > View </a>`
      );
    }
    return ``;
  }

  viewBuilding(params) {
    if (params.value && params.value !== '' && params.value !== 'None') {
      return (
        params.value +
        ` <a href='${urlPortfolio}/building#building_id=` +
        params.value +
        `' > View </a>`
      );
    }
    return ``;
  }

  setLayoutBuildingData(layout, unitsArray, buildingsArray) {
    layout['building_referenced'] = false;
    if (layout.unit_id) {
      const unit = unitsArray.find(unit => unit.unit_id === layout.unit_id);
      if (unit) {
        layout['building_id'] = unit.building_id;
        const building = buildingsArray.find(building => building.building_id === unit.building_id);
        if (building) {
          layout['building_referenced'] = ManagerFunctions.isReferencedBuilding(building);
        }
      }
    }
  }

  analyzeModelStructure(layout) {
    const model = layout['model_structure'];
    const analysis = {
      area: [],
      toilet: [],
      kitchen: [],
      balcony: [],
    };
    this.analyzeModelStructureRecursive(model.children, analysis);

    layout['total_area'] = [
      ...analysis.area,
      ...analysis.toilet,
      ...analysis.kitchen,
      ...analysis.balcony,
    ];
    layout['area'] = analysis.area;
    layout['toilet'] = analysis.toilet;
    layout['kitchen'] = analysis.kitchen;
    layout['balcony'] = analysis.balcony;
  }
  calculateArea(element) {
    const currentArray = element.footprint.coordinates[0];
    const currentArrayVector = currentArray.map(coor => new Vector2(coor[COOR_X], coor[COOR_Y]));
    const calculatedM2 = Math.abs(ShapeUtils.area(currentArrayVector));
    return calculatedM2;
  }
  analyzeModelStructureRecursive(elements, analysis) {
    if (elements) {
      elements.forEach(element => {
        if (element.type === 'AreaType.KITCHEN') {
          analysis.kitchen.push(this.calculateArea(element));
        } else if (element.type === 'AreaType.BATHROOM') {
          analysis.toilet.push(this.calculateArea(element));
        } else if (element.type === 'AreaType.NOT_DEFINED') {
          analysis.area.push(this.calculateArea(element));
        } else if (element.type === 'AreaType.BALCONY') {
          analysis.balcony.push(this.calculateArea(element));
        }

        this.analyzeModelStructureRecursive(element.children, analysis);
      });
    }
  }

  ngOnInit() {
    /** LAYOUTS */

    ApiFunctions.get(this.http, 'buildings', buildings => {
      const buildingsArray = <Building[]>buildings;

      ApiFunctions.get(this.http, 'layouts', layouts => {
        const layoutsArray = <Layout[]>layouts;

        ApiFunctions.get(this.http, 'units', units => {
          const unitsArray = <Unit[]>units;

          layoutsArray.forEach(layout => {
            this.setLayoutBuildingData(layout, unitsArray, buildingsArray);
            this.analyzeModelStructure(layout);
          });

          this.buildColumDefinitions(layouts, units, buildings);

          this.gridOptions = <GridOptions>{
            rowData: layoutsArray,
            columnDefs: this.columnDefs,

            /** Pagination */
            ...ManagerFunctions.pagination,
            ...ManagerFunctions.columnOptions,

            onCellValueChanged: params => {
              ManagerFunctions.reactToEdit(
                this.http,
                params,
                'layout_id',
                'layouts',
                this.gridOptions.api,
                (nodeData, element) => {
                  // if the new Layout has model_structure we update it.
                  if (element.model_structure) {
                    nodeData['model_structure'] = element.model_structure;
                    this.analyzeModelStructure(nodeData);
                  }

                  // if the new Layout has new unit id, we update the building data.
                  if (element.unit_id) {
                    this.setLayoutBuildingData(nodeData, unitsArray, buildingsArray);
                  }
                }
              );
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

              // this.gridOptions.api.sizeColumnsToFit();

              this.fragment_sub = ManagerFunctions.setDefaultFilters(
                this.route,
                this.columnDefs,
                this.gridApi
              );
            },
          };
        });
      });
    });
  }

  delete() {
    ManagerFunctions.reactToDelete(
      this.http,
      this.selectedRows,
      this.gridOptions.api,
      'layout',
      'layouts',
      'layout_id',
      'layouts'
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
}
