import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../../_shared-libraries/ManagerFunctions';

/** Padding when displaying many buildings in the map */
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

/**
 * We need the scale to be in meters
 */
const scaleLineControl = new ScaleLine();
scaleLineControl.setUnits('metric');

import OlStyle from 'ol/style/Style';
import OlStyleFill from 'ol/style/Fill';
import OlStyleStroke from 'ol/style/Stroke';

import {
  click as conditionClick,
  pointerMove as conditionPointerMove,
  never as conditionNever,
} from 'ol/events/condition';

import Select from 'ol/interaction/Select';

import { parseParms } from '../../_shared-libraries/Url';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Add the Swiss topo projection
 */
import {
  calculateDomain,
  drawHexBlocks,
  reduceHeatmap,
} from '../../_shared-libraries/HexagonFunctions';

import { NavigationService, OverlayService } from '../../_services';
import { ApiFunctions } from '../../_shared-libraries/ApiFunctions';
import { registerAllProjections } from '../../_shared-libraries/MapProjections';
import { colors } from '../../_shared-libraries/SimData';
import { styleNormal, styleOver } from '../../_shared-libraries/OlMapStyles';
import { environment } from '../../../environments/environment';
registerAllProjections();

@Component({
  selector: 'app-map-overview',
  templateUrl: './map-overview.component.html',
  styleUrls: ['./map-overview.component.scss'],
})
export class MapOverviewComponent implements OnInit, OnDestroy {
  /** String container of any error */
  generalError = null;

  /** True to start and false once all the data is loaded */
  loading = true;

  /**
   * Data for the legend
   */

  /** Matrix with all the hexagon values */
  legendData;
  /** Value to color function */
  unit;
  /** Unit of the current hexagon values */
  color;
  /** Minimun value of the current range */
  min;
  /** Maximun  value of the current range */
  max;

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

  /**
   * Mapbox Style selected
   * light, dark, outdoors, streets, satellite
   */
  mapStyle;

  /** List of displayed cities for the drop-down */
  cities = [];
  /** List of displayed countries for the drop-down */
  countries = [];

  /** Selected Country to filter */
  filterCountry = null;
  /** Selected City to filter */
  filterCity = null;

  /** Selected Source to filter */
  filterSource = null;

  /** display */
  showFilter = false;

  currentSimulation = 'buildings';

  /** Floor displayed */
  currentFloor = 0;
  numberOfFloors = 1;

  floors = [0];

  enabledPV = false;
  displayedPV = false;

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
    private navigationService: NavigationService
  ) {
    navigationService.profile$.subscribe(newProfile => {
      this.currentProfile = newProfile;
    });
  }

  ngOnInit() {
    this.start();
  }

  /** Request all the data and set up the map */
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
        'access_token=' +
        environment.mapboxToken,
    });

    this.layer.setSource(this.source);
  }

  /** Once we have the data we set up the open layers map*/
  setUpMap() {
    this.map = null;
    this.numGeoreferencedBuildings = 0;
    this.simulations = [];
    this.features = [];

    // Empty map div
    document.getElementById('map').innerHTML = '';

    this.showFilter = false;

    this.buildingsArray.forEach(building => {
      /** Filtering */
      if (
        // If the building is not defined
        !building ||
        // If the building has no address
        !building.address ||
        // If the building has no a country different than the selected
        (this.filterCountry !== null &&
          building.address.country !== this.filterCountry) ||
        // If the building has no a city different than the selected
        (this.filterCity !== null &&
          building.address.city !== this.filterCity) ||
        // If the building has no building_references
        !building['building_references']
      ) {
        return false;
      }

      let referenced = null;
      let map_source = null;

      if (building && building.building_references) {
        let ref = building.building_references.find(
          ref =>
            ref.source === 'open_street_maps' &&
            ref.id !== null &&
            ref.id !== ''
        );
        if (ref && ref.id !== '') {
          map_source = 'open_street_maps';
          referenced = ref.id;
        } else {
          ref = building.building_references.find(
            ref =>
              ref.source === 'swiss_topo' && ref.id !== null && ref.id !== ''
          );

          // Swiss topo is defined
          if (ref && ref.id !== '') {
            map_source = 'swiss_topo';
            referenced = ref.id;
          }
        }
      }

      if (this.filterSource === null) {
        this.filterSource = map_source;
      } else if (this.filterSource !== map_source) {
        this.showFilter = true;
        return false;
      }

      if (referenced !== null) {
        let feature;
        let epsg;
        if (building.footprints) {
          const footprint = building.footprints.find(
            fp => fp.source === map_source
          );
          if (footprint) {
            epsg = footprint.epsg;
            feature = new OlFeature({
              geometry: new OlPolygon(footprint.coordinates[0]),
            });
            // To recover the value
            feature.setId(building.building_id);
          }
        }

        // footprints
        if (feature) {
          ApiFunctions.get(
            this.http,
            'buildings/' + building.building_id + '/simulations',
            simulations => {
              if (
                simulations &&
                simulations['potential_view'] &&
                simulations['potential_view'].result
              ) {
                // We order the potential view by height (If defined)
                simulations['potential_view'].result.sort(
                  (a, b) => a.height - b.height
                );
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
                    'access_token=' +
                    environment.mapboxToken,
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
                      const buildingId = featureId.substr(
                        postion,
                        featureId.length - postion
                      );

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
            },
            error => {
              console.error('Building with no sims', error, building);
            },
            {
              params: {
                simulation_packages: ['potential_view'],
              },
            }
          );
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
    if (
      simulations &&
      simulations['potential_view'] &&
      simulations['potential_view'].result
    ) {
      this.drawSimulation(
        building,
        feature,
        simulations['potential_view'].result
      );
    } else {
      this.detailSource.addFeature(feature);
    }
    this.globalSource.addFeature(feature);
  }

  drawSimulation(building, feature, sim_result) {
    const categorySimulations = sim_result.filter(
      sim => sim.category === this.currentSimulation
    );
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

      this.min = 0;

      const max = 1.5;
      this.max = max * 100 / (Math.PI * 4);
      this.unit = '%';
      this.legendData = heatmap;
      this.color = colors;

      const valueToColor = calculateDomain(colors, this.min, max);

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
      this.displayedPV = true;
    } else {
      this.detailLayer.setVisible(false);
      this.globalLayer.setVisible(true);
      this.displayedPV = false;
    }
  }

  /** Change the simulation and redraw the simulations */
  changeSimulation(data) {
    if (this.currentSimulation !== data.target.value) {
      this.currentSimulation = data.target.value;
      this.redrawSimulations();
    }
  }

  /** Change the floor and redraw the simulations */
  changeFloor(data) {
    if (this.currentFloor !== data.target.value) {
      this.currentFloor = data.target.value;
      this.redrawSimulations();
    }
  }

  /**
   * Change the map style from mapbox
   */
  changeMap(data) {
    const newValue = `mapStyle=${data.target.value}`;
    this.router.navigate([], {
      fragment: newValue,
      relativeTo: this.route,
      replaceUrl: true,
    });
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

  /** Change country filter */
  filterByCountry(country) {
    this.filterCountry = country;
    this.setUpMap();
  }

  /** Change city filter */
  filterByCity(city) {
    this.filterCity = city;
    this.setUpMap();
  }

  /** Change map source */
  changeSource(data) {
    this.filterSource = data.target.value;

    // We reset the cities
    this.cities = [];
    this.countries = [];

    this.setUpMap();
  }

  /** Enable potential view */
  enablePV() {
    this.enabledPV = true;
    this.correctVisibility(this.view.values_.resolution);
  }

  /** Disable potential view */
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
