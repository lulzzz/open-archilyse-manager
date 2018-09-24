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

import OlStyle from 'ol/style/Style';
import OlStyleFill from 'ol/style/Fill';
import OlStyleStroke from 'ol/style/Stroke';
import KML from 'ol/format/KML';
import { get as getProjection } from 'ol/proj';

import {
  click as conditionClick,
  pointerMove as conditionPointerMove,
  never as conditionNever,
} from 'ol/events/condition';

import Select from 'ol/interaction/Select';

import { parseParms } from '../url';
import { ApiFunctions } from '../apiFunctions';
import { ActivatedRoute, Router } from '@angular/router';

import { OverlayService } from '../../_services';
import { Subscription } from 'rxjs/Subscription';
import { environment } from '../../../environments/environment';
import { calculateDomain, drawHexBlocks, reduceHeatmap } from '../hexagonFunctions';
import { getBuildingLink, getLayoutLink, getUnitLink } from '../portfolioLinks';
import { sim_result_mock } from './mock';

const apiUrl = environment.apiUrl;
const urlPortfolio = environment.urlPortfolio;

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

const saveData = (() => {
  const a = document.createElement('a');
  document.body.appendChild(a);
  return (fileName, data) => {
    const blob = new Blob([data], { type: 'octet/stream' });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
})();

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
export class ViewSimOverviewComponent implements OnInit, OnDestroy {
  /**
   * Loading and general error
   */

  generalError = null;
  loading = true;

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
  globalLayer: OlVectorLayer;

  detailSource;
  globalSource;

  view: OlView;

  referenceSource = 'swiss_topo';

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

  /**
   * Subscriptions
   */
  fragment_sub: Subscription;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private infoDialog: OverlayService
  ) {}

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

    console.log('this.building', this.building);
    console.log('this.referenceSource', this.referenceSource);

    if (this.building['building_references']) {
      const br = this.building['building_references'].find(
        br => br.source === this.referenceSource
      );
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
    const debug = true;
    if (debug) {
      console.log('sim_result_mock', sim_result_mock);
      this.sim_result = sim_result_mock;

      this.sim_result.sort((a, b) => a.height - b.height);

      this.setUpMapWithSimulations(epsg);

      this.globalSource.addFeature(this.feature);
      this.drawSimulation(this.feature);

      this.loading = false;
      this.centerMap();

      return false;
    }

    this.http
      .get(apiUrl + 'layouts/' + this.layoutId + '/simulations', {
        params: {
          simulation_packages: ['view'],
        },
      })
      .subscribe(
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
        }
      );
  }

  setUpMapWithSimulations(epsg) {
    if (this.map === null) {
      this.mapStyle = 'satellite';

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

      this.globalSource = new Vector({
        features: [],
      });

      this.detailLayer = new OlVectorLayer({
        source: this.detailSource,
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
        target: 'map',
        layers: [this.layer, this.globalLayer, this.detailLayer],
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
              const value = sim.heatmap[yy][xx];
              totalValue += value;
              return {
                category: sim.category,
                value: value,
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
        const valueToColor = calculateDomain(
          colors,
          0,
          this.summary.max > 1.5 ? this.summary.max : 1.5
        );

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
      } else {
        this.loading = false;
        this.generalError = `Selected floor not found`;
      }
    } else {
      this.loading = false;
      this.generalError = `Selected simulation not found`;
    }
  }

  removeOldFeatures() {
    const features = this.detailSource.getFeatures();
    features.forEach(feature => {
      this.detailSource.removeFeature(feature);
    });
  }

  /**
   * Exports a kml File.
   */
  exportKML() {
    const introduction = `<?xml version="1.0" encoding="UTF-8"?>
        <kml xmlns="http://www.opengis.net/kml/2.2">
          <Document>
            <name>Layout ${this.layout.name} Id#${this.layout.layout_id}</name>
            <open>1</open>
            <description> ${this.address} </description>`;

    const originalSimulation = this.currentSimulation;
    const originalFloor = this.currentFloor;

    let content = '';
    const simulationsToExport = ['buildings', 'rivers', 'trees'];
    for (let i = 0; i < simulationsToExport.length; i += 1) {
      this.currentSimulation = simulationsToExport[i];

      // There's no need from extra folder
      // let contentFolder = `<Folder><name>Simulation ${this.currentSimulation}</name>`;
      let contentFolder = ``;

      // Only the original simulation is visible by default
      if (this.currentSimulation !== originalSimulation) {
        contentFolder += `<visibility>0</visibility>`;
      }
      for (let j = 0; j < this.floors.length; j += 1) {
        this.currentFloor = this.floors[j];
        this.drawSimulation(this.feature);
        const result = this.exportSimulationKML();
        if (j === 0) {
          if (i === 0) {
            content += result.camera;
          }
          contentFolder += result.camera;
        }
        contentFolder += result.data;
      }

      // contentFolder += `</Folder>`;

      content += contentFolder;
    }

    const end = `
        </Document>
    </kml>`;

    saveData('Archilyse.kml', introduction + content + end);

    // Revert to the original simulation:
    this.currentSimulation = originalSimulation;
    this.currentFloor = originalFloor;
    this.drawSimulation(this.feature);
  }

  exportSimulationKML() {
    const format = new KML();
    const features = this.detailSource.getFeatures();

    const result = format.writeFeaturesNode(features, {
      featureProjection: this.view.getProjection(),
      dataProjection: getProjection('EPSG:4326'),
    });

    const documents = result.childNodes[0];
    const featureLists = documents.childNodes;
    const height = this.height;
    const absolute_height = this.absolute_height;
    const heightStrSpace = `,${absolute_height} `;
    const heightStr = `,${absolute_height}`;

    let center = null;

    const placemarks = [];
    featureLists.forEach(feature => {
      const featureXML = feature.childNodes;
      const style = featureXML[0];
      const polygon = featureXML[1];

      const XXX = polygon.childNodes[0];
      const YYY = XXX.childNodes[0];
      const coordinateTag = YYY.childNodes[0];
      const coordinates = coordinateTag.childNodes[0];
      const coords = coordinates.nodeValue.split(' ');
      const coordinatesStr = coords.join(heightStrSpace) + heightStr;

      const exagonColor = style.childNodes[0].childNodes[0].childNodes[0].data;

      if (center === null) {
        center = coords[0].split(',');
      }

      // Documentation:
      // https://developers.google.com/kml/documentation/kmlreference#polystyle
      placemarks.push(`
        <Placemark>
          <Style><LineStyle><color>${exagonColor}</color></LineStyle><PolyStyle><color>${exagonColor}</color><fill>1</fill></PolyStyle></Style>
          <Polygon><altitudeMode>absolute</altitudeMode><outerBoundaryIs><LinearRing><coordinates>${coordinatesStr}</coordinates></LinearRing></outerBoundaryIs></Polygon>
        </Placemark>`);
    });

    const lookAt = `<LookAt>
            <longitude>${center[0]}</longitude><latitude>${center[1]}</latitude>
            <altitude>${
              this.absolute_height
            }</altitude><heading>0</heading><tilt>50</tilt><range>30</range>
          </LookAt>`;

    return {
      camera: lookAt,
      data: `<Folder><name>${this.currentSimulation} simulation</name>
          <description> Analyzes the ${
            this.currentSimulation
          } visibility </description>${lookAt}${placemarks}
         </Folder>`,
    };
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
    this.globalLayer.setVisible(resolution >= referenceResolution);
  }

  viewRaw() {
    window.location.href = `${urlPortfolio}/simulation/layout/${this.layoutId}`;
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
  changeFloor(data) {
    console.log('Floor changed', data.target.value);
    this.currentFloor = data.target.value;
    this.drawSimulation(this.feature);
  }

  /**
   * Displays information about the displayed simulation.
   */
  showInfoSim() {
    if (this.currentSimulation === 'buildings') {
      this.infoDialog.open({
        data: {
          title: 'Potential view: Buildings information.',
          body:
            'This simulations represents the amount of visible buildings from inside each part of the current building.',
          image: null,
        },
      });
    } else if (this.currentSimulation === 'streets') {
      this.infoDialog.open({
        data: {
          title: 'Potential view: Streets information.',
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