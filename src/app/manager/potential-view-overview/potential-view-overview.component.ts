import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/** Padding when displaying many buildings in the map */
export const paddingToBuildings = [25, 25, 70, 25];

import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import OlVectorLayer from 'ol/layer/Vector';
import OlView from 'ol/View';
import Vector from 'ol/source/Vector';
import OlFeature from 'ol/Feature';
import OlPolygon from 'ol/geom/Polygon';
import { defaults as defaultControls, ScaleLine } from 'ol/control';

/**
 * We need the scale to be in meters
 */
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
import { KmlExport } from '../../_shared-components/KMLexport/kmlExport';
import { colors } from '../../_shared-libraries/SimData';
import { styleNormal, styleOver } from '../../_shared-libraries/OlMapStyles';

@Component({
  selector: 'app-potential-view-overview',
  templateUrl: './potential-view-overview.component.html',
  styleUrls: ['./potential-view-overview.component.scss'],
})
export class PotentialViewOverviewComponent extends KmlExport
  implements OnInit, OnDestroy {
  /** String container of any error */
  generalError = null;

  /** True to start and false once all the data is loaded */
  loading = true;

  /**
   * Data for the legend
   */

  legendData;
  unit;
  color;
  min;
  max;

  /**
   * TABLE DOCUMENTATION
   * https://www.ag-grid.com/angular-getting-started/
   */

  buildingId;
  building;
  address;

  map: OlMap = null;
  source: OlXYZ;
  layer: OlTileLayer;

  detailLayer: OlVectorLayer;
  globalLayer: OlVectorLayer;

  detailSource;
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

  /** user profile */
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
    this.buildingId = this.route.snapshot.params['buildingId'];

    if (this.buildingId) {
      ApiFunctions.get(
        this.http,
        `buildings/${this.buildingId}`,
        building => {
          if (building) {
            this.building = building;
            const address = building['address'];
            const buildingName = building['name']
              ? building['name']
              : this.buildingId;
            if (address) {
              const street = address.street ? address.street : '';
              const street_nr = address.street_nr ? address.street_nr : '';
              const postal_code = address.postal_code
                ? address.postal_code
                : '';
              const city = address.city ? address.city : '';
              const country = address.country ? address.country : '';

              const addressStr = `${street} ${street_nr}, ${postal_code} ${city} - (${country}) `;
              this.address = `<span class="label-dpoi">Building "${buildingName}":</span> <span class="address-text">${addressStr}</span>`;
              this.setUpMap();
            } else {
              this.loading = false;
              this.generalError = `Address not defined for building <span class="address-text">${buildingName}</span>`;
            }
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
      this.generalError = `Building id not provided`;
    }
  }

  setUpMap() {
    this.map = null;

    // Empty map div
    document.getElementById('map').innerHTML = '';

    let referenced = null;
    let map_source = null;
    let map_source_str = '';

    if (this.building['building_references']) {
      const st = this.building['building_references'].find(
        br => br.source === 'swiss_topo'
      );
      const osm = this.building['building_references'].find(
        br => br.source === 'open_street_maps'
      );

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
        const footprint = this.building.footprints.find(
          fp => fp.source === map_source
        );
        if (footprint) {
          epsg = footprint.epsg;

          this.feature = new OlFeature({
            geometry: new OlPolygon(footprint.coordinates[0]),
          });
          // To recover the value
          this.feature.setId(this.building.building_id);
        }
      }

      if (this.feature) {
        ApiFunctions.get(
          this.http,
          'buildings/' + this.buildingId + '/simulations',
          simulations => {
            console.log('simulations', simulations['potential_view']);

            if (simulations && simulations['potential_view']) {
              if (simulations['potential_view']['status'] === 'complete') {
                if (simulations['potential_view']['result']) {
                  this.sim_result = simulations['potential_view']['result'];

                  this.sim_result.sort((a, b) => a.height - b.height);

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
                      controls: defaultControls({
                        zoom: false,
                      }).extend([scaleLineControl]),
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

                    this.fragment_sub = this.route.fragment.subscribe(
                      fragment => {
                        const urlParams = parseParms(fragment);
                        if (urlParams.hasOwnProperty('mapStyle')) {
                          this.changeMapStyle(urlParams['mapStyle']);
                        }
                      }
                    );

                    // select interaction working on "pointermove"
                    this.selectPointerClick = new Select({
                      condition: conditionClick,
                      style: styleOver,
                    });

                    this.map.addInteraction(this.selectPointerClick);

                    this.selectPointerClick.on('select', e => {
                      if (e.selected.length > 0 && e.selected[0].id_) {
                        const featureId = e.selected[0].id_;
                        if (
                          featureId.includes('#') &&
                          featureId.includes('||')
                        ) {
                          // It's an hexagon

                          const postion = featureId.indexOf('||');
                          const buildingId = featureId.substr(
                            postion + 2,
                            featureId.length - postion
                          );
                          const coords = featureId
                            .substr(0, postion)
                            .split('#');

                          const xx = Math.abs(coords[0]);
                          const yy = Math.abs(coords[1]);

                          const thisHeightSims = this.sim_result.filter(
                            sim => sim.height === this.height
                          );

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

                          // window.location.href = `${urlPortfolio}/building#building_id=${buildingId}`;
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

                  this.globalSource.addFeature(this.feature);
                  this.drawSimulation(this.feature);

                  this.loading = false;
                  this.centerMap();
                } else {
                  this.loading = false;
                  this.generalError = `Potential view is empty for the given building`;
                }
              } else {
                this.loading = false;
                this.generalError = `Potential view is not yet ready for the given building`;
              }
            } else {
              this.loading = false;
              this.generalError = `Potential view not available for the given building`;
            }
          },
          error => {
            this.loading = false;
            this.generalError = `Potential view not available for the given building`;
            console.error(error);
          },
          {
            params: {
              simulation_packages: ['potential_view'],
            },
          }
        );
      } else {
        this.loading = false;
        this.generalError = `Perimeter not found for the given building in ${map_source_str}`;
      }
    } else {
      this.loading = false;
      this.generalError = `Building not georeferenced in ${map_source_str}`;
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

        this.min = 0;
        const max = this.summary.max > 1.5 ? this.summary.max : 1.5;
        this.max = max * 100 / (Math.PI * 4);
        this.unit = '%';
        this.legendData = heatmap;
        this.color = colors;

        // this.summary.min, this.summary.max
        // 0, 5
        // this.summary.min, this.summary.max
        const valueToColor = calculateDomain(colors, 0, max);

        /*
          this.summary.min,
          this.summary.max
          // 0,
          // 1.2 // this.summary.max > 1.2 ? this.summary.max : 1.2
        );
        */

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
                this.buildingId,
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

  /**
   * Exports a kml File.
   */
  exportKML() {
    this.export(
      this.drawSimulation,
      `Building ${this.building.name} Id#${this.building.building_id}`,
      true
    );
  }

  removeOldFeatures() {
    const features = this.detailSource.getFeatures();
    features.forEach(feature => {
      this.detailSource.removeFeature(feature);
    });
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
    this.router.navigate([
      'manager',
      'simulation',
      'building',
      this.buildingId,
    ]);
  }

  changeMap(data) {
    const newValue = `mapStyle=${data.target.value}`;
    this.router.navigate([], {
      fragment: newValue,
      relativeTo: this.route,
      replaceUrl: true,
    });
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

  /** Unsubscribe before destroying */
  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }
}
