import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export const paddingToBuildings = [25, 25, 25, 25];

import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import OlVectorLayer from 'ol/layer/Vector';
import OlView from 'ol/View';
import Vector from 'ol/source/Vector';
import OlFeature from 'ol/Feature';
import OlPolygon from 'ol/geom/Polygon';
import { defaults as defaultControls, ScaleLine } from 'ol/control';

const scaleLineControl = new ScaleLine();
scaleLineControl.setUnits('metric');

import OlStyle from 'ol/style/Style';
import OlStyleFill from 'ol/style/Fill';
import OlStyleStroke from 'ol/style/Stroke';

import { click as conditionClick } from 'ol/events/condition';

import Select from 'ol/interaction/Select';

import { parseParms } from '../../_shared-libraries/Url';
import { ApiFunctions } from '../../_shared-libraries/ApiFunctions';
import { ActivatedRoute, Router } from '@angular/router';

import { NavigationService, OverlayService } from '../../_services';
import { Subscription } from 'rxjs/Subscription';

import {
  calculateDomain,
  drawHexBlocks,
  reduceHeatmap,
} from '../../_shared-libraries/HexagonFunctions';
import {
  getBuildingLink,
  getLayoutLink,
  getUnitLink,
} from '../../_shared-libraries/PortfolioLinks';
import { KmlExport } from '../../_shared-components/KMLexport/kmlExport';
import { EditorConstants } from '../../_shared-libraries/EditorConstants';
import { COOR_X, COOR_Y } from '../../_shared-libraries/SimData';

export const colors = [
  '#2c7bb6',
  '#00a6ca',
  '#00ccbc',
  '#90eb9d',
  '#ffff8c',
  '#f9d057',
  '#f29e2e',
  '#e76818',
  '#d7191c',
];

const styleNormal = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(255, 0, 0, 0.7)',
  }),
  stroke: new OlStyleStroke({
    color: 'rgba(255, 0, 0, 1)',
    width: 2,
  }),
});

const styleOver = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(255, 0, 0, 0.5)',
  }),
  stroke: new OlStyleStroke({
    color: 'rgba(255, 0, 0, 0.5)',
    width: 3,
    lineCap: 'round',
  }),
});

@Component({
  selector: 'app-view-sim-overview',
  templateUrl: './view-sim-overview.component.html',
  styleUrls: ['./view-sim-overview.component.scss'],
})
export class ViewSimOverviewComponent extends KmlExport implements OnInit, OnDestroy {
  /**
   * Loading and general error
   */

  generalError = null;
  loading = true;

  /**
   * Data for the legend
   */

  legendData;
  unitStr;
  color;
  min;
  max;

  /**
   * TABLE DOCUMENTATION
   * https://www.ag-grid.com/angular-getting-started/
   */

  unitId;
  unit;
  buildingId;
  building;

  layoutId;
  layout;
  address;

  map: OlMap = null;
  source: OlXYZ;
  layer: OlTileLayer;

  detailLayer: OlVectorLayer;
  layoutLayer: OlVectorLayer;
  globalLayer: OlVectorLayer;

  detailSource;
  layoutSource;
  globalSource;

  view: OlView;

  selectPointerClick;
  selectPointerMove;

  mapStyle;

  currentSimulation = 'buildings';
  currentFloor = 0;
  height;
  absolute_height;
  summary;

  feature;
  sim_result;
  numberOfFloors = 0;
  floors = [];

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
    super();
    navigationService.profile$.subscribe(newProfile => {
      this.currentProfile = newProfile;
    });
  }

  ngOnInit() {
    this.start();
  }

  changeMapStyle(mapStyle) {
    this.mapStyle = mapStyle;

    this.source = new OlXYZ({
      url:
        'https://api.tiles.mapbox.com/v4/mapbox.' +
        this.mapStyle +
        '/{z}/{x}/{y}.png?' +
        'access_token=***REMOVED***',
    });

    this.layer.setSource(this.source);
  }

  start() {
    this.layoutId = this.route.snapshot.params['layoutId'];

    if (this.layoutId) {
      ApiFunctions.get(
        this.http,
        `layouts/${this.layoutId}`,
        layout => {
          if (layout) {
            // Save the layout
            this.layout = layout;
            console.log('layout', layout);

            this.startWithLayout();
          } else {
            this.loading = false;
            this.generalError = `Layout ${getLayoutLink(this.layoutId)} not found.`;
          }
        },
        error => {
          this.loading = false;
          this.generalError = `Layout ${getLayoutLink(this.layoutId)} not found.`;
          console.error(error);
        }
      );
    } else {
      this.loading = false;
      this.generalError = `Layout id not provided`;
    }
  }

  startWithLayout() {
    if (this.layout.unit_id) {
      this.unitId = this.layout.unit_id;

      ApiFunctions.get(
        this.http,
        `units/${this.unitId}`,
        unit => {
          if (unit) {
            // Save the unit
            this.unit = unit;
            console.log('unit', unit);

            this.startWithUnit();
          } else {
            this.loading = false;
            this.generalError = `Unit not found for ${this.unitId}`;
          }
        },
        error => {
          this.loading = false;
          this.generalError = `Unit ${getUnitLink(
            this.unitId
          )} not found for layout ${getLayoutLink(this.layoutId, this.layout)}.`;
          console.error(error);
        }
      );
    } else {
      this.loading = false;
      this.generalError = `Layout ${getLayoutLink(this.layoutId, this.layout)} has not unit id.`;
    }
  }

  startWithUnit() {
    if (this.unit.building_id) {
      this.buildingId = this.unit.building_id;

      ApiFunctions.get(
        this.http,
        `buildings/${this.buildingId}`,
        building => {
          if (building) {
            // Save the building
            this.building = building;
            console.log('building', building);
            console.log('building.perimeter', building.perimeter);

            this.startWithBuilding();
          } else {
            this.loading = false;
            this.generalError = `Building not found for ${this.buildingId}`;
          }
        },
        error => {
          this.loading = false;
          this.generalError = `Building not found for ${this.buildingId}`;
          console.error(error);
        }
      );
    } else {
      this.loading = false;
      this.generalError = `Unit ${getUnitLink(this.unitId, this.unit)} has not building id.`;
    }
  }

  startWithBuilding() {
    let buildingRefId = null;

    if (this.building['building_references'] && this.building['building_references'].length) {
      const br = this.building['building_references'][0];
      if (br && br.id) {
        buildingRefId = br.id;
      }
    }

    if (buildingRefId !== null) {
    } else {
      this.loading = false;
      this.generalError = `Building ${getBuildingLink(
        this.buildingId,
        this.building
      )} was not referenced`;
    }

    const layoutName = this.layout['name'] ? this.layout['name'] : this.layoutId;
    this.address = `<span class="label-dpoi">Layout "${layoutName}"</span>`;
    this.setUpMap();
  }

  setUpMap() {
    this.map = null;

    // Empty map div
    document.getElementById('map').innerHTML = '';

    let referenced = null;
    let map_source = null;
    let map_source_str = '';

    if (this.building['building_references']) {
      const st = this.building['building_references'].find(br => br.source === 'swiss_topo');
      const osm = this.building['building_references'].find(br => br.source === 'open_street_maps');

      if (st && st.id) {
        map_source = 'swiss_topo';
        map_source_str = 'Swiss Topo';
        referenced = st.id;
      } else if (osm && osm.id) {
        map_source = 'open_street_maps';
        map_source_str = 'Open Street Maps';
        referenced = osm.id;
      }
    }

    if (referenced !== null) {
      let epsg;
      if (this.building.footprints) {
        const footprint = this.building.footprints.find(fp => fp.source === map_source);
        if (footprint) {
          epsg = footprint.epsg;

          this.feature = new OlFeature({ geometry: new OlPolygon(footprint.coordinates[0]) });
          // To recover the value
          this.feature.setId(this.building.building_id);
        }
      }

      if (this.feature) {
        this.setUpMapWithFeature(epsg);
      } else {
        this.loading = false;
        this.generalError = `Perimeter not found for the given building in ${map_source_str}`;
      }
    } else {
      this.loading = false;
      this.generalError = `Building not georeferenced in ${map_source_str}`;
    }
  }

  setUpMapWithFeature(epsg) {
    ApiFunctions.get(
      this.http,
      'layouts/' + this.layoutId + '/simulations',
      simulations => {
        console.log('simulations', simulations['view']);

        if (simulations && simulations['view']) {
          if (simulations['view']['status'] === 'complete') {
            if (simulations['view']['result']) {
              this.sim_result = simulations['view']['result'];

              this.sim_result.sort((a, b) => a.height - b.height);

              this.setUpMapWithSimulations(epsg);

              this.globalSource.addFeature(this.feature);
              this.drawSimulation(this.feature);

              this.loading = false;
              this.centerMap();
            } else {
              this.loading = false;
              this.generalError = `View is empty for the given layout`;
            }
          } else {
            this.loading = false;
            this.generalError = `View is not yet ready for the given layout`;
          }
        } else {
          this.loading = false;
          this.generalError = `View not available for the given layout`;
        }
      },
      error => {
        this.loading = false;
        this.generalError = `View not available for the given layout`;
        console.error(error);
      },
      {
        params: {
          simulation_packages: ['view'],
        },
      }
    );
  }

  setUpMapWithSimulations(epsg) {
    if (this.map === null) {
      this.mapStyle = 'streets';

      this.source = new OlXYZ({
        url:
          'https://api.tiles.mapbox.com/v4/mapbox.' +
          this.mapStyle +
          '/{z}/{x}/{y}.png?' +
          'access_token=***REMOVED***',
      });

      this.detailSource = new Vector({
        features: [],
      });

      this.layoutSource = new Vector({
        features: [],
      });

      this.globalSource = new Vector({
        features: [],
      });

      this.detailLayer = new OlVectorLayer({
        source: this.detailSource,
        style: styleNormal,
      });

      this.layoutLayer = new OlVectorLayer({
        source: this.layoutSource,
        style: styleNormal,
      });

      this.globalLayer = new OlVectorLayer({
        source: this.globalSource,
        style: styleNormal,
      });

      this.layer = new OlTileLayer({
        source: this.source,
      });

      this.view = new OlView({
        projection: 'EPSG:' + epsg,
      });

      this.map = new OlMap({
        controls: defaultControls({
          zoom: false,
        }).extend([scaleLineControl]),
        target: 'map',
        layers: [this.layer, this.globalLayer, this.detailLayer, this.layoutLayer],
        view: this.view,
      });

      this.view.on('propertychange', e => {
        switch (e.key) {
          case 'resolution':
            this.correctVisibility(e.oldValue);
            break;
        }
      });

      this.fragment_sub = this.route.fragment.subscribe(fragment => {
        const urlParams = parseParms(fragment);
        if (urlParams.hasOwnProperty('mapStyle')) {
          this.changeMapStyle(urlParams['mapStyle']);
        }
      });

      // select interaction working on "pointermove"
      this.selectPointerClick = new Select({
        condition: conditionClick,
        style: styleOver,
      });

      this.map.addInteraction(this.selectPointerClick);

      this.selectPointerClick.on('select', e => {
        if (e.selected.length > 0 && e.selected[0].id_) {
          const featureId = e.selected[0].id_;
          if (featureId.includes('#') && featureId.includes('||')) {
            // It's an hexagon

            const postion = featureId.indexOf('||');
            const layoutId = featureId.substr(postion + 2, featureId.length - postion);
            const coords = featureId.substr(0, postion).split('#');

            const xx = Math.abs(coords[0]);
            const yy = Math.abs(coords[1]);

            const thisHeightSims = this.sim_result.filter(sim => sim.height === this.height);

            let totalValue = 0;
            const simValues = thisHeightSims.map(sim => {
              const heatmapValue = sim.heatmap[yy][xx];
              totalValue += heatmapValue;
              return {
                category: sim.category,
                value: heatmapValue,
              };
            });

            console.log('simValues', simValues);
            console.log('totalValue', totalValue);

            // window.location.href = `${urlPortfolio}/building#building_id=${layoutId}`;
          } else {
            console.log('BUILDING', e.selected[0].id_);
            /**
            // It's a building
            window.location.href = `${urlPortfolio}/building#building_id=${
              e.selected[0].id_
              }`;
            */
          }
        }
      });
    }
  }

  drawSimulation(feature) {
    const categorySimulations = this.sim_result.filter(
      sim => sim.category === this.currentSimulation
    );

    if (categorySimulations && categorySimulations.length) {
      this.numberOfFloors = categorySimulations.length;
      this.floors = [];
      for (let i = 0; i < this.numberOfFloors; i += 1) {
        this.floors.push(i);
      }

      if (this.currentFloor < this.numberOfFloors) {
        const sim = categorySimulations[this.currentFloor];

        this.height = sim.height;
        this.absolute_height = sim.absolute_height;
        this.summary = sim.summary;
        const starting_point = sim['starting_point'];
        const heatmap = sim['heatmap'];
        const no_value_number = sim['no_value_number'];
        const height = sim['height'];
        const resolution = sim['resolution'];
        const x_off = starting_point[0]; // 947839.4323007881;
        const y_off = starting_point[1]; // 6005873.054931145;

        // this.summary.min, this.summary.max
        // 0, 5
        // this.summary.min, this.summary.max

        this.min = 0;

        const max = this.summary.max > 1.5 ? this.summary.max : 1.5;
        this.max = max * 100 / (Math.PI * 4);

        this.unitStr = '%';
        this.legendData = heatmap;
        this.color = colors;

        const valueToColor = calculateDomain(colors, this.min, max);

        const colorAverage = valueToColor(this.summary.average);

        feature.setStyle(
          new OlStyle({
            fill: new OlStyleFill({
              color: colorAverage,
            }),
            stroke: new OlStyleStroke({
              color: colorAverage,
              width: 2,
            }),
          })
        );

        const result = reduceHeatmap(heatmap, resolution, no_value_number);
        const currentHeatmap = result.heatmap;
        const resolutionCorrected = result.resolution;

        this.removeOldFeatures();
        this.removeOldLayout();

        currentHeatmap.forEach((row, y) => {
          row.forEach((val, x) => {
            if (val !== no_value_number) {
              drawHexBlocks(
                this.layoutId,
                this.detailSource,
                x_off,
                y_off,
                x,
                -y,
                resolutionCorrected,
                valueToColor,
                val
              );
            }
          });
        });

        const movement = this.layout.movements[0];
        this.drawModelStructure(movement, this.layout.model_structure);
      } else {
        this.loading = false;
        this.generalError = `Selected floor not found`;
      }
    } else {
      this.loading = false;
      this.generalError = `Selected simulation not found`;
    }
  }

  drawModelStructure(movement, modelStructure) {
    modelStructure.floors.forEach(floor => {
      this.drawModelStructureRecursive(movement, floor);
    });
  }

  drawPolygons(movement, type, coordinates, color) {
    const newCoords = this.correctCoords(movement, coordinates);
    newCoords.forEach((newCoord, i) => {
      this.drawCoords(newCoord, i, color, null, null);
    });
  }

  drawGeometries(movement, type, coordinates, lineColor, lineWidth) {
    const newCoords = this.correctCoords(movement, coordinates);
    newCoords.forEach((newCoord, i) => {
      this.drawCoords(newCoord, i, null, lineColor, lineWidth);
    });
  }

  correctCoords(movement, coordinates) {
    const radians = movement.angle * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    return coordinates.map(coordinateRow =>
      coordinateRow.map(coor => {
        const x = coor[COOR_X] - movement.x_pivot;
        const y = coor[COOR_Y] - movement.y_pivot;

        const xFinal = x * cos - y * sin + movement.x_pivot;
        const yFinal = x * sin + y * cos + movement.y_pivot;

        return [xFinal + movement.x_off, yFinal + movement.y_off];
      })
    );
  }

  drawCoords(coords, featureId, colorToFill, lineColor, lineWidth) {
    const feature = new OlFeature({ geometry: new OlPolygon([coords]) });
    // To recover the value
    // feature.setId(featureId);

    this.layoutSource.addFeature(feature);

    // const colorValue = 'rgb(253, 239, 123)';

    feature.setStyle(
      new OlStyle({
        fill:
          colorToFill !== null
            ? new OlStyleFill({
                color: colorToFill,
              })
            : null,
        stroke: new OlStyleStroke({
          color: lineColor,
          width: lineWidth,
        }),
      })
    );
  }

  drawModelStructureRecursive(movement, structure) {
    const opacity = 0.95;

    const white = `rgba(255, 255, 255, ${opacity})`;
    const grey = `rgba(155, 155, 155, ${opacity})`;
    const darkGrey = `rgba(75, 75, 75, ${opacity})`;
    const black = `rgba(0, 0, 0, ${opacity})`;

    /** Features */
    if (structure.type === EditorConstants.TOILET) {
    } else if (structure.type === EditorConstants.STAIRS) {
    } else if (structure.type === EditorConstants.SINK) {
    } else if (structure.type === EditorConstants.KITCHEN) {
    } else if (structure.type === EditorConstants.DESK) {
    } else if (structure.type === EditorConstants.CHAIR) {
    } else if (structure.type === EditorConstants.OFFICE_MISC) {
    } else if (structure.type === EditorConstants.MISC) {
      /** Separators */
    } else if (
      structure.type === EditorConstants.SEPARATOR_NOT_DEFINED ||
      structure.type === EditorConstants.ENVELOPE ||
      structure.type === EditorConstants.RAILING
    ) {
      this.drawPolygons(movement, EditorConstants.WALL, structure.footprint.coordinates, black);

      /** AreaType */
    } else if (
      structure.type === EditorConstants.SHAFT ||
      structure.type === EditorConstants.BALCONY ||
      structure.type === EditorConstants.CORRIDOR ||
      structure.type === EditorConstants.STOREROOM ||
      structure.type === EditorConstants.ROOM ||
      structure.type === EditorConstants.DINING ||
      structure.type === EditorConstants.BATHROOM ||
      structure.type === EditorConstants.AREA_KITCHEN ||
      structure.type === EditorConstants.AREA_KITCHEN_DINING ||
      structure.type === EditorConstants.AREA_NOT_DEFINED
    ) {
      // this.drawPolygons(movement, EditorConstants.AREA, structure.footprint.coordinates, white);
      /** SpaceType */
    } else if (structure.type === EditorConstants.SPACE_NOT_DEFINED) {
      if (structure.footprint && structure.footprint.coordinates) {
        // this.drawPolygons(movement, EditorConstants.AREA, structure.footprint.coordinates, white);
      }

      /** OpeningType */
    } else if (structure.type === EditorConstants.DOOR) {
      if (structure.footprint && structure.footprint.coordinates) {
        this.drawGeometries(movement, structure.type, structure.footprint.coordinates, white, 1.5);
      }
      console.log('opening_area ', structure);
      if (structure.opening_area) {
        for (let i = 0; i < structure.opening_area.length; i += 1) {
          const opening_area = structure.opening_area[i];

          const numPoints = 10;
          const points = [opening_area.axis];

          const distRef = this.distance(
            opening_area.open[COOR_X],
            opening_area.open[COOR_Y],
            opening_area.axis[COOR_X],
            opening_area.axis[COOR_Y]
          );

          for (let i = 0; i <= numPoints; i += 1) {
            const rectX =
              opening_area.close[COOR_X] * i / numPoints +
              opening_area.open[COOR_X] * (numPoints - i) / numPoints;
            const rectY =
              opening_area.close[COOR_Y] * i / numPoints +
              opening_area.open[COOR_Y] * (numPoints - i) / numPoints;

            const currentDist = this.distance(
              opening_area.axis[COOR_X],
              opening_area.axis[COOR_Y],
              rectX,
              rectY
            );

            const correction = 1 - currentDist / distRef;

            const newPoint = [
              rectX + (rectX - opening_area.axis[COOR_X]) * correction,
              rectY + (rectY - opening_area.axis[COOR_Y]) * correction,
            ];

            points.push(newPoint);
          }

          this.drawGeometries(movement, structure.type, [points], darkGrey, 1.5);
        }
      }
    } else if (
      structure.type === EditorConstants.WINDOW_ENVELOPE ||
      structure.type === EditorConstants.WINDOW_INTERIOR
    ) {
      this.drawGeometries(movement, structure.type, structure.footprint.coordinates, 0x333333, 1);
      this.drawPolygons(movement, structure.type, structure.footprint.coordinates, white);

      /** Undefined */
    } else if (structure.type === EditorConstants.to_be_filled) {
    } else if (structure.type) {
      console.error('UNKNOWN analyzeStructure ', structure.type);
    }

    if (structure.children) {
      structure.children.forEach(child => {
        this.drawModelStructureRecursive(movement, child);
      });
    }
  }

  distance(coor1X, coor1Y, coor2X, coor2Y) {
    return Math.sqrt(Math.pow(coor2X - coor1X, 2) + Math.pow(coor2Y - coor1Y, 2));
  }

  removeOldLayout() {
    const features = this.layoutSource.getFeatures();
    features.forEach(feature => {
      this.layoutSource.removeFeature(feature);
    });
  }
  removeOldFeatures() {
    const features = this.detailSource.getFeatures();
    features.forEach(feature => {
      this.detailSource.removeFeature(feature);
    });
  }

  exportKML() {
    this.export(
      this.drawSimulation,
      `Layout ${this.layout.name} Id#${this.layout.layout_id}`,
      false
    );
  }

  /**
   * Centers the map in the screen.
   */
  centerMap() {
    this.view.fit(this.detailSource.getExtent(), {
      padding: paddingToBuildings,
      constrainResolution: false,
      nearest: false,
    });

    this.correctVisibility(this.view.values_.resolution);
  }

  /**
   * Based in the zoom level will display the detailLayer or the globalLayer
   * @param resolution
   */
  correctVisibility(resolution) {
    const referenceResolution = 1.5;

    this.detailLayer.setVisible(resolution < referenceResolution);
    this.layoutLayer.setVisible(resolution < referenceResolution);
    this.globalLayer.setVisible(resolution >= referenceResolution);
  }

  viewRaw() {
    this.router.navigate(['manager', 'simulation', 'layout', this.layoutId]);
  }

  changeMap(data) {
    const newValue = `mapStyle=${data.target.value}`;
    this.router.navigate([], { fragment: newValue, relativeTo: this.route, replaceUrl: true });
  }

  /**
   * Change simulations.
   */

  changeSimulation(data) {
    console.log('Simulation changed', data.target.value);
    this.currentSimulation = data.target.value;
    this.drawSimulation(this.feature);
  }

  /**
   * Displays information about the displayed simulation.
   */
  showInfoSim() {
    if (this.currentSimulation === 'buildings') {
      this.infoDialog.open({
        data: {
          title: 'Real view: Buildings information.',
          body:
            'This simulations represents the amount of visible buildings from inside each part of the current building.',
          image: null,
        },
      });
    } else if (this.currentSimulation === 'streets') {
      this.infoDialog.open({
        data: {
          title: 'Real view: Streets information.',
          body:
            'This simulations represents the amount of visible streets from inside each part of the current building.',
          image: null,
        },
      });
    }
  }

  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }
}
