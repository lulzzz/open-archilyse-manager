import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export const paddingToBuildings = [25, 25, 25, 25];

import OlMap from 'ol/map';
import OlXYZ from 'ol/source/xyz';
import OlTileLayer from 'ol/layer/tile';
import OlVectorLayer from 'ol/layer/vector';
import OlView from 'ol/view';
import Vector from 'ol/source/vector';
import GeoJSON from 'ol/format/geojson';

import OlStyle from 'ol/style/style';
import OlStyleFill from 'ol/style/fill';
import OlStyleStroke from 'ol/style/stroke';
import OlFeature from 'ol/feature';
import OlPolygon from 'ol/geom/polygon';

import condition from 'ol/events/condition';
import Select from 'ol/interaction/select';

import { parseParms } from '../url';
import { ApiFunctions } from '../apiFunctions';
import { ActivatedRoute, Router } from '@angular/router';

import * as d3 from 'd3';
import { OverlayService } from '../../_services/overlay.service';
import { Subscription } from 'rxjs/Subscription';
import { environment } from '../../../environments/environment';

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

Array.prototype['contains'] = function(v) {
  for (let i = 0; i < this.length; i += 1) {
    if (this[i] === v) {
      return true;
    }
  }
  return false;
};

Array.prototype['unique'] = function() {
  const arr = [];
  for (let i = 0; i < this.length; i += 1) {
    if (!arr.includes(this[i])) {
      arr.push(this[i]);
    }
  }
  return arr;
};

@Component({
  selector: 'app-potential-view-overview',
  templateUrl: './potential-view-overview.component.html',
  styleUrls: ['./potential-view-overview.component.scss'],
})
export class PotentialViewOverviewComponent implements OnInit, OnDestroy {
  /**
   * Loading and general error
   */

  generalError = null;
  loading = true;

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
    this.buildingId = this.route.snapshot.params['buildingId'];

    if (this.buildingId) {
      ApiFunctions.get(
        this.http,
        `buildings/${this.buildingId}`,
        building => {
          if (building) {
            this.building = building;
            const address = building['address'];
            const buildingName = building['name'] ? building['name'] : this.buildingId;
            if (address) {
              const street = address.street ? address.street : '';
              const street_nr = address.street_nr ? address.street_nr : '';
              const postal_code = address.postal_code ? address.postal_code : '';
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
    }
  }

  setUpMap() {
    this.map = null;

    // Empty map div
    document.getElementById('map').innerHTML = '';

    let referenced = null;
    let map_source = null;
    let map_source_str = '';
    if (this.building['building_reference']['swiss_topo']) {
      map_source = 'swiss_topo';
      map_source_str = 'Swiss Topo';
      referenced = this.building['building_reference']['swiss_topo'];
    } else if (this.building['building_reference']['open_street_maps']) {
      map_source = 'open_street_maps';
      map_source_str = 'Open Street Maps';
      referenced = this.building['building_reference']['open_street_maps'];
    }

    if (referenced !== null) {
      this.http
        .get(apiUrl + 'buildings/' + this.buildingId + '/surroundings', {
          params: {
            source: map_source,
          },
        })
        .subscribe(
          surroundings => {
            const features = new GeoJSON().readFeatures(surroundings['geojson']);
            if (features.length > 0) {
              this.feature = features.find(feature => feature.id_ === referenced);
              if (this.feature) {
                this.http
                  .get(apiUrl + 'buildings/' + this.buildingId + '/simulations', {
                    params: {
                      simulation_packages: ['potential_view'],
                    },
                  })
                  .subscribe(
                    simulations => {
                      console.log('simulations', simulations['potential_view']);

                      if (simulations && simulations['potential_view']) {
                        if (simulations['potential_view']['status'] === 'complete') {
                          if (simulations['potential_view']['result']) {
                            this.sim_result = simulations['potential_view']['result'];

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
                                projection: surroundings['geojson']['crs'].properties.name,
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
                                condition: condition.click,
                                style: styleOver,
                              });

                              this.selectPointerMove = new Select({
                                condition: condition.pointerMove,
                                style: styleOver,
                              });

                              this.map.addInteraction(this.selectPointerMove);
                              this.map.addInteraction(this.selectPointerClick);

                              this.selectPointerClick.on('select', e => {
                                if (e.selected.length > 0) {
                                  // localhost:4200/manager/building#site_id=5b7d5793ed37e50009414a1a
                                  // urlPortfolio/building#site_id=5b7d5793ed37e50009414a1a
                                  window.location.href = `${urlPortfolio}/building#building_reference.open_street_maps=${
                                    e.selected[0].id_
                                  }`;
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
                    }
                  );
              } else {
                this.loading = false;
                this.generalError = `Perimeter not found for the given building in ${map_source_str}`;
              }
            } else {
              this.loading = false;
              this.generalError = `Surroundings not found for the given building in ${map_source_str}`;
            }
          },
          error => {
            this.loading = false;
            this.generalError = `Surroundings not found for the given building in ${map_source_str}`;
            console.error(error);
          }
        );
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
      console.log('this.floors', this.floors);
      if (this.currentFloor < this.numberOfFloors) {
        const sim = categorySimulations[this.currentFloor];

        this.summary = sim.summary;
        const starting_point = sim['starting_point'];
        const heatmap = sim['heatmap'];
        const no_value_number = sim['no_value_number'];
        const height = sim['height'];
        const resolution = sim['resolution'];
        const x_off = 952689.08554846; // starting_point[0]; // 947839.4323007881;
        const y_off = 6003896.234569793; // starting_point[1]; // 6005873.054931145;

        // this.summary.min, this.summary.max
        const valueToColor = this.calculateDomain(colors, 0, 5);

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

        const result = this.reduceHeatmap(heatmap, resolution, no_value_number);
        const currentHeatmap = result.heatmap;
        const resolutionCorrected = result.resolution;

        this.removeOldFeatures();

        currentHeatmap.forEach((row, y) => {
          row.forEach((val, x) => {
            if (val !== no_value_number) {
              this.drawHexBlocks(x_off, y_off, x, y, resolutionCorrected, valueToColor, val);
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

  reduceHeatmap(heatmap, resolution, no_value_number) {
    let numberOfhexagons = 0;
    heatmap.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== no_value_number) {
          numberOfhexagons += 1;
        }
      });
    });

    console.log('numberOfhexagons', numberOfhexagons);
    let currentHeatmap = heatmap;
    let resolutionCorrected = resolution;

    const maxNumberPoligons = 900;

    while (numberOfhexagons > maxNumberPoligons) {
      numberOfhexagons = 0;
      const heatmapCorrected = [];
      let newY = 0;
      for (let y = 1; y < currentHeatmap.length - 1; y += 3) {
        if (!heatmapCorrected[newY]) {
          heatmapCorrected[newY] = [];
        }
        let newX = 0;
        for (let x = 1; x < currentHeatmap[y].length - 1; x += 3) {
          heatmapCorrected[newY][newX] = currentHeatmap[y][x];
          if (currentHeatmap[y][x] !== no_value_number) {
            numberOfhexagons += 1;
          }
          newX += 1;
        }
        newY += 1;
      }
      currentHeatmap = heatmapCorrected;
      resolutionCorrected = resolution * 3;
    }

    console.log('numberOfhexagons END', numberOfhexagons);
    console.log('resolutionCorrected', resolutionCorrected);

    return {
      heatmap: currentHeatmap,
      resolution: resolutionCorrected,
    };
  }

  removeOldFeatures() {
    const features = this.detailSource.getFeatures();
    features.forEach(feature => {
      this.detailSource.removeFeature(feature);
    });
  }

  /**
   * Given the color array maps from min to max to a color
   * Returns the transforming function
   * @param color
   * @param min
   * @param max
   * @returns function
   */
  calculateDomain(color, min, max) {
    // Create a domain that divides the range of values
    const domain = color.map((c, i) => min + i / (color.length - 1) * (max - min));

    // Create a scale that allows us to convert our values to a colour
    return d3
      .scaleLinear()
      .domain(domain)
      .range(color);
  }

  drawHexBlocks(
    x_off: number,
    y_off: number,
    x: number,
    y: number,
    resolution: number,
    valueToColor,
    val
  ) {
    const sin30 = 0.5; // 0.5 = sin 30 deg
    const cos30 = 0.866; // 0.866 = cos 30 deg

    const radious = resolution / 2;

    const deltaY = radious * sin30;
    const deltaX = radious * cos30;

    // If on an odd row, offset it so that the hexagons tessallate
    const offset = y % 2 ? radious : 0;
    const finalX = x_off + x * resolution + offset;
    const finalY = y_off + y * resolution * cos30;

    const coords = [
      [finalX, finalY - radious], // 12h
      [finalX - deltaX, finalY - deltaY], // 10h
      [finalX - deltaX, finalY + deltaY], //  8h
      [finalX, finalY + radious], //  6h
      [finalX + deltaX, finalY + deltaY], //  4h
      [finalX + deltaX, finalY - deltaY], //  2h
      [finalX, finalY - radious], // 12h
    ];

    const colorValue = valueToColor(val);
    const feature = new OlFeature({ geometry: new OlPolygon([coords]) });
    feature.setStyle(
      new OlStyle({
        fill: new OlStyleFill({
          color: colorValue,
        }),
        stroke: new OlStyleStroke({
          color: colorValue,
          width: 2,
        }),
      })
    );
    this.detailSource.addFeature(feature);
  }

  centerMap() {
    this.view.fit(this.detailSource.getExtent(), {
      padding: paddingToBuildings,
      constrainResolution: false,
      nearest: false,
    });

    this.correctVisibility(this.view.values_.resolution);
  }

  correctVisibility(resolution) {
    if (resolution < 2.5) {
      this.detailLayer.setVisible(true);
      this.globalLayer.setVisible(true);
    } else {
      this.detailLayer.setVisible(false);
      this.globalLayer.setVisible(true);
    }
  }

  viewRaw() {
    window.location.href = `${urlPortfolio}/simulation/building/${this.buildingId}`;
  }

  changeMap(data) {
    const newValue = `mapStyle=${data.target.value}`;
    this.router.navigate([], { fragment: newValue, relativeTo: this.route, replaceUrl: true });
  }

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
