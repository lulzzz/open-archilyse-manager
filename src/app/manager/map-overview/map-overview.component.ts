import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../managerFunctions';

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

import {
  click as conditionClick,
  pointerMove as conditionPointerMove,
  never as conditionNever,
} from 'ol/events/condition';

import Select from 'ol/interaction/Select';

import { parseParms } from '../url';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

const apiUrl = environment.apiUrl;
const urlPortfolio = environment.urlPortfolio;

/**
 * Add the Swiss topo projection
 */
import { register as RegisterProjections } from 'ol/proj/proj4';
import proj4 from 'proj4';
import { calculateDomain, drawHexBlocks, reduceHeatmap } from '../hexagonFunctions';
import { colors } from '../potential-view-overview/potential-view-overview.component';

proj4.defs(
  'EPSG:2056',
  '+proj=somerc ' +
    '+lat_0=46.95240555555556 +lon_0=7.439583333333333 ' +
    '+k_0=1 +x_0=2600000 +y_0=1200000 ' +
    '+ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs'
);
RegisterProjections(proj4);

const styleNormal = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(210, 210, 210, 0.7)',
  }),
  stroke: new OlStyleStroke({
    color: 'rgba(170, 170, 170, 1)',
    width: 2,
  }),
});

const styleOver = new OlStyle({
  fill: new OlStyleFill({
    color: 'rgba(150, 150, 150, 0.5)',
  }),
  stroke: new OlStyleStroke({
    color: 'rgba(110, 110, 110, 0.5)',
    width: 3,
    lineCap: 'round',
  }),
});

@Component({
  selector: 'app-map-overview',
  templateUrl: './map-overview.component.html',
  styleUrls: ['./map-overview.component.scss'],
})
export class MapOverviewComponent implements OnInit, OnDestroy {
  /**
   * Loading and general error
   */

  generalError = null;
  loading = true;

  /**
   * TABLE DOCUMENTATION
   * https://www.ag-grid.com/angular-getting-started/
   */

  buildingsArray;

  numGeoreferencedBuildings = 0;
  simulations;
  features;

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

  cities = [];
  countries = [];

  filterCountry = null;
  filterCity = null;

  currentSimulation = 'buildings';
  currentFloor = 0;
  numberOfFloors = 1;

  floors = [0];

  enabledPV = false;

  /**
   * Subscriptions
   */
  fragment_sub: Subscription;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.start();
  }

  start() {
    ManagerFunctions.requestAllData(
      this.http,
      (sitesArray, buildingsArray, unitsArray, layoutsArray) => {
        this.loading = false;

        this.buildingsArray = buildingsArray;

        this.cities = [];
        this.countries = [];

        this.setUpMap();
      },
      error => {
        this.generalError = `<div class="title">Unknown error requesting the API data: </div> ${
          error.message
        }`;
      }
    );
  }

  /**
   * We can show any mapbox.com style
   * @param mapStyle
   */
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

  setUpMap() {
    this.map = null;
    this.numGeoreferencedBuildings = 0;
    this.simulations = [];
    this.features = [];

    // Empty map div
    document.getElementById('map').innerHTML = '';

    this.buildingsArray.forEach(building => {
      /** Filtering */
      if (
        // If the building is not defined
        !building ||
        // If the building has no address
        !building.address ||
        // If the building has no a country different than the selected
        (this.filterCountry !== null && building.address.country !== this.filterCountry) ||
        // If the building has no a city different than the selected
        (this.filterCity !== null && building.address.city !== this.filterCity) ||
        // If the building has no building_references
        !building['building_references']
      ) {
        return false;
      }

      let referenced = null;
      let map_source = null;

      if (building && building.building_references) {
        let ref = building.building_references.find(
          ref => ref.source === 'open_street_maps' && ref.id !== null && ref.id !== ''
        );
        if (ref && ref.id !== '') {
          map_source = 'open_street_maps';
          referenced = ref.id;
        } else {
          ref = building.building_references.find(
            ref => ref.source === 'swiss_topo' && ref.id !== null && ref.id !== ''
          );

          // Swiss topo is defined
          if (ref && ref.id !== '') {
            map_source = 'swiss_topo';
            referenced = ref.id;
          }
        }
      }

      if (referenced !== null) {
        let feature;
        let epsg;
        if (building.footprints) {
          const footprint = building.footprints.find(fp => fp.source === map_source);
          if (footprint) {
            epsg = footprint.epsg;

            feature = new OlFeature({ geometry: new OlPolygon(footprint.coordinates[0]) });
            // To recover the value
            feature.setId(building.building_id);
          }
        }

        // footprints
        if (feature) {
          this.http
            .get(apiUrl + 'buildings/' + building.building_id + '/simulations', {
              params: {
                simulation_packages: ['potential_view'],
              },
            })
            .subscribe(simulations => {
              if (
                simulations &&
                simulations['potential_view'] &&
                simulations['potential_view'].result
              ) {
                // We order the potential view by height (If defined)
                simulations['potential_view'].result.sort((a, b) => a.height - b.height);
              }

              this.simulations[building.building_id] = simulations;

              this.features[building.building_id] = feature;

              this.numGeoreferencedBuildings += 1;

              if (this.cities.indexOf(building.address.city) === -1) {
                this.cities.push(building.address.city);
                this.cities.sort(); // a to Z
              }
              if (this.countries.indexOf(building.address.country) === -1) {
                this.countries.push(building.address.country);
                this.countries.sort(); // a to Z
              }

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
                  target: 'map',
                  layers: [this.layer, this.detailLayer, this.globalLayer],
                  view: this.view,
                });

                // select interaction working on "pointermove"
                this.selectPointerClick = new Select({
                  condition: conditionClick,
                  style: styleOver,
                });

                this.selectPointerMove = new Select({
                  condition: conditionPointerMove,
                  style: styleOver,
                });

                this.map.addInteraction(this.selectPointerMove);
                this.map.addInteraction(this.selectPointerClick);

                this.selectPointerClick.on('select', e => {
                  if (e.selected.length > 0 && e.selected[0].id_) {
                    const featureId = e.selected[0].id_;
                    if (featureId.includes('#') && featureId.includes('||')) {
                      // It's an hexagon

                      const postion = featureId.indexOf('||') + 2;
                      const buildingId = featureId.substr(postion, featureId.length - postion);

                      this.router.navigate(['building'], {
                        fragment: `building_id=${buildingId}`,
                      });
                    } else {
                      // It's a building
                      this.router.navigate(['building'], {
                        fragment: `building_id=${e.selected[0].id_}`,
                      });
                    }
                  }
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
              }

              this.drawSimulations(building, simulations, feature);
              this.centerMap();
            });
        } else {
          console.log('Building not footprint', building);
        }
      } else {
        console.log('Building not referenced', building);
      }
    });
  }

  redrawSimulations() {
    this.buildingsArray.forEach(building => {
      if (
        this.features[building.building_id] &&
        this.simulations[building.building_id] &&
        this.simulations[building.building_id]['potential_view'] &&
        this.simulations[building.building_id]['potential_view'].result
      ) {
        this.drawSimulation(
          building,
          this.features[building.building_id],
          this.simulations[building.building_id]['potential_view'].result
        );
      }
    });
  }

  drawSimulations(building, simulations, feature) {
    if (simulations && simulations['potential_view'] && simulations['potential_view'].result) {
      this.drawSimulation(building, feature, simulations['potential_view'].result);
    } else {
      this.detailSource.addFeature(feature);
    }
    this.globalSource.addFeature(feature);
  }

  drawSimulation(building, feature, sim_result) {
    const categorySimulations = sim_result.filter(sim => sim.category === this.currentSimulation);
    if (categorySimulations && categorySimulations.length) {
      // Always the hier number of floors
      const nOf = categorySimulations.length;
      if (nOf > this.numberOfFloors) {
        this.numberOfFloors = nOf;
        this.floors = [];
        for (let i = 0; i < this.numberOfFloors; i += 1) {
          this.floors.push(i);
        }
      }

      let currentF = this.currentFloor;
      if (currentF >= nOf) {
        currentF = nOf - 1;
      }

      const sim = categorySimulations[currentF];

      const starting_point = sim['starting_point'];
      const heatmap = sim['heatmap'];
      const no_value_number = sim['no_value_number'];
      const height = sim['height'];
      const resolution = sim['resolution'];
      const x_off = starting_point[0]; // 947839.4323007881;
      const y_off = starting_point[1]; // 6005873.054931145;

      // this.summary.min, this.summary.max
      // 0, 5
      // sim.summary.min, sim.summary.max
      const valueToColor = calculateDomain(colors, 0, 1.5);

      const colorAverage = valueToColor(sim.summary.average);

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

      currentHeatmap.forEach((row, y) => {
        row.forEach((val, x) => {
          if (val !== no_value_number) {
            drawHexBlocks(
              building.building_id,
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
   * Center the map in the displayed buildings
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
   * IF the resolution is low (<1.5) and the Potential View is enabled THEN:
   * We display the details
   * @param resolution
   */
  correctVisibility(resolution) {
    if (resolution < 1.5 && this.enabledPV) {
      this.detailLayer.setVisible(true);
      this.globalLayer.setVisible(false);
    } else {
      this.detailLayer.setVisible(false);
      this.globalLayer.setVisible(true);
    }
  }

  /**
   * Change the fimulation or the floor
   */

  changeSimulation(data) {
    this.currentSimulation = data.target.value;
    this.redrawSimulations();
  }
  changeFloor(data) {
    this.currentFloor = data.target.value;
    this.redrawSimulations();
  }

  /**
   * Change the map style from mapbox
   */
  changeMap(data) {
    const newValue = `mapStyle=${data.target.value}`;
    this.router.navigate([], { fragment: newValue, relativeTo: this.route, replaceUrl: true });
  }

  /**
   * Link to the current building
   */

  linkToList() {
    const filters = [];
    if (this.filterCountry !== null) {
      filters.push(`address.country=${this.filterCountry}`);
    }
    if (this.filterCity !== null) {
      filters.push(`address.city=${this.filterCity}`);
    }
    this.router.navigate(['manager', 'building'], {
      fragment: filters.join('&'),
    });
  }

  /**
   * Change filters
   */

  filterByCountry(country) {
    this.filterCountry = country;
    this.setUpMap();
  }

  filterByCity(city) {
    this.filterCity = city;
    this.setUpMap();
  }

  /**
   * Enable and disable potential view
   */
  enablePV() {
    this.enabledPV = true;
    this.correctVisibility(this.view.values_.resolution);
  }
  disablePV() {
    this.enabledPV = false;

    this.detailLayer.setVisible(false);
    this.globalLayer.setVisible(true);
  }

  /**
   * Unsubscribe
   */
  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }
}
