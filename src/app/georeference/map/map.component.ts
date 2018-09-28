import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import OlVectorLayer from 'ol/layer/Vector';
import OlView from 'ol/View';

import Vector from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Select from 'ol/interaction/Select';
import ol from 'ol';
import {
  paddingToBuilding,
  paddingToBuildings,
  styleNormal,
  styleOver,
  styleSelected,
  styleProbable,
  styleVeryProbable,
  selectPreselected,
} from '../data';

import {
  click as conditionClick,
  pointerMove as conditionPointerMove,
  never as conditionNever,
} from 'ol/events/condition';
import { parseParms } from '../url';
import { Subscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { BatchService } from '../../_services';
import { getBuildingLink } from '../portfolioLinks';
import { environment } from '../../../environments/environment';
const apiUrl = environment.apiUrl;

/**
 * Add the Swiss topo projection
 */
import { register as RegisterProjections } from 'ol/proj/proj4';
import proj4 from 'proj4';

proj4.defs(
  'EPSG:2056',
  '+proj=somerc ' +
    '+lat_0=46.95240555555556 +lon_0=7.439583333333333 ' +
    '+k_0=1 +x_0=2600000 +y_0=1200000 ' +
    '+ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs'
);
RegisterProjections(proj4);

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
  building;
  buildingId;
  layoutId;

  // Batch information
  nextBatch;
  hasNextBatch;

  map: OlMap;
  source: OlXYZ;
  layer: OlTileLayer;
  vectorLayer: OlVectorLayer;
  view: OlView;

  mapHelp;
  vectorSource;

  referenceSource;
  referenceCoordinates;
  referenceSourceHumanStr;

  candidates_ids;
  top_shot_id;
  features;
  loading;
  error = null;

  displayVectors = true;

  mapStyle;
  buildingReferenceId = null;
  buildingFeature = null;

  buildingReferenceIdPreselected = null;
  buildingReferenceIdPreselectedUser = null;
  buildingReferenceIdPreselectedDate = null;

  selectPointerMove;
  selectPointerClick;
  selectProbable;
  selectVeryProbable;
  selectPreselected;

  processEnded;

  /**
   * Subscriptions
   */
  fragment_sub: Subscription;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private _router: Router,
    private batchService: BatchService
  ) {}

  ngOnInit() {
    console.log('ngOnInit');

    this.loading = true;
    this.fragment_sub = this.route.fragment.subscribe(fragment => {
      const urlParams = parseParms(fragment);
      if (urlParams.hasOwnProperty('source')) {
        this.referenceSource = urlParams['source'];
      }

      this.route.params.subscribe(params => {
        console.log('paramsparams', params);
        this.startData();
      });
    });

    this.startBasicData();
  }

  startBasicData() {
    this.mapStyle = 'streets';

    this.source = new OlXYZ({
      url:
        'https://api.tiles.mapbox.com/v4/mapbox.' +
        this.mapStyle +
        '/{z}/{x}/{y}.png?' +
        'access_token=***REMOVED***',
    });
  }

  referenceToHuman() {
    if (this.referenceSource === 'swiss_topo') {
      this.referenceSourceHumanStr = 'Swiss topo';
    } else if (this.referenceSource === 'open_street_maps') {
      this.referenceSourceHumanStr = 'Open street maps';
    }
  }

  startData() {
    /** Reset the data */
    this.mapHelp = '';
    document.getElementById('map').innerHTML = '';
    this.error = null;

    /** The fade in process (only executed once at the end) */
    this.processEnded = false;

    this.buildingId = this.route.snapshot.params['buildingid'];
    this.layoutId = this.route.snapshot.params['layoutid'];

    if (!this.referenceSource) {
      this.referenceSource = this.batchService.getSource();
      this.referenceToHuman();
    }

    this.referenceCoordinates = this.batchService.getCoordinates();

    this.hasNextBatch = this.batchService.hasNextLine();
    this.nextBatch = this.batchService.getLines();

    this.http.get(apiUrl + 'buildings/' + this.buildingId).subscribe(
      building => {
        this.building = building;

        const address = building['address'];
        if (address) {
          const street = address.street ? address.street : '';
          const street_nr = address.street_nr ? address.street_nr : '';
          const postal_code = address.postal_code ? address.postal_code : '';
          const city = address.city ? address.city : '';
          const country = address.country ? address.country : '';

          const addressStr = `${street} ${street_nr}, ${postal_code} ${city} - (${country}) `;
          this.mapHelp = `Current address : <span class="green-text">${addressStr}</span>`;
        } else {
          const buildingName = building['name'] ? building['name'] : this.buildingId;
          this.mapHelp = `Address not defined for building <span class="green-text">${buildingName}</span>`;
        }

        // Empty map div
        document.getElementById('map').innerHTML = '';

        const options = {
          params: {},
        };
        if (this.referenceSource) {
          options.params['source'] = this.referenceSource;
        }

        if (this.referenceCoordinates) {
          options.params['coordinates'] = this.referenceCoordinates;
        }

        this.http.get(apiUrl + 'buildings/' + this.buildingId + '/surroundings', options).subscribe(
          surroundings => {
            if (typeof surroundings['source'] !== 'undefined' && surroundings['source'] !== null) {
              this.referenceSource = surroundings['source'];
              this.referenceToHuman();
            }

            this.candidates_ids = surroundings['candidates_ids'];
            this.top_shot_id = surroundings['top_shot_id'];

            let referenceSource = null;
            if (building['building_references']) {
              referenceSource = building['building_references'].find(
                br => br.source === this.referenceSource
              );
            }

            if (referenceSource && referenceSource !== null) {
              this.buildingReferenceIdPreselected = referenceSource.id;

              // TODO: Check when the API returns the user
              this.buildingReferenceIdPreselectedUser = '????';
              this.buildingReferenceIdPreselectedDate = '11.11.1111';

              this.buildingReferenceId = this.buildingReferenceIdPreselected;
            } else {
              if (this.top_shot_id) {
                this.buildingReferenceId = this.top_shot_id;
              }
            }

            this.features = new GeoJSON().readFeatures(surroundings['geojson']);

            if (this.features.length > 0) {
              // Empty map div
              document.getElementById('map').innerHTML = '';

              this.vectorSource = new Vector({
                features: this.features,
              });

              this.vectorLayer = new OlVectorLayer({
                source: this.vectorSource,
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
                layers: [this.layer, this.vectorLayer],
                view: this.view,
              });

              this.centerMap();

              // select interaction working on "pointermove"
              this.selectPointerClick = new Select({
                condition: conditionClick,
                style: styleSelected,
              });

              this.selectPointerMove = new Select({
                condition: conditionPointerMove,
                style: styleOver,
              });

              this.selectProbable = new Select({
                condition: conditionNever,
                style: styleProbable,
              });

              this.selectVeryProbable = new Select({
                condition: conditionNever,
                style: styleVeryProbable,
              });

              this.selectPreselected = new Select({
                condition: conditionNever,
                style: selectPreselected,
              });

              this.map.addInteraction(this.selectPointerMove);
              this.map.addInteraction(this.selectPointerClick);
              this.map.addInteraction(this.selectProbable);
              this.map.addInteraction(this.selectVeryProbable);
              this.map.addInteraction(this.selectPreselected);

              /* tslint:disable */
              const that = this;
              /* tslint:enable */

              this.selectPointerClick.on('select', e => {
                if (e.selected.length > 0 && !that.processEnded) {
                  this.buildingFeature = e.selected[0];
                  this.buildingReferenceId = this.buildingFeature.getId();
                } else {
                  this.buildingReferenceId = null;
                }
                this.repaintCandidates();
              });

              this.map.on('pointermove', function(evt) {
                const hit = this.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                  return true;
                });

                if (hit && !that.processEnded) {
                  document.body.style.cursor = 'pointer';
                } else {
                  document.body.style.cursor = '';
                }
              });

              this.loading = false;
              this.repaintCandidates();

              this.fragment_sub = this.route.fragment.subscribe(fragment => {
                const urlParams = parseParms(fragment);
                if (urlParams.hasOwnProperty('mapStyle')) {
                  this.changeMapStyle(urlParams['mapStyle']);
                }
              });
            } else {
              this.loading = false;
              this.error = `Surroundings for building ${getBuildingLink(
                this.buildingId,
                this.building
              )} not found in ${this.referenceSourceHumanStr}.`;
            }
          },
          error => {
            this.loading = false;
            this.error = `Error calculating the surroundings for building ${getBuildingLink(
              this.buildingId,
              this.building
            )}.`;
            console.error(error);
          }
        );
      },
      error => {
        this.loading = false;
        this.error = `Building ${getBuildingLink(this.buildingId, this.building)} not found.`;
        console.error(error);
      }
    );
  }

  repaintCandidates() {
    let selected_collection;

    selected_collection = this.selectPreselected.getFeatures();
    selected_collection.clear();
    if (this.displayVectors && this.buildingReferenceIdPreselected !== null) {
      const found = this.features.find(f => f.id_ === this.buildingReferenceIdPreselected);

      console.log(
        'found',
        found,
        this.features.map(f => f.id_),
        this.buildingReferenceIdPreselected
      );

      if (found) {
        selected_collection.push(found);
      }
    }

    selected_collection = this.selectPointerClick.getFeatures();
    selected_collection.clear();
    if (this.displayVectors && this.buildingReferenceId) {
      const found = this.features.find(f => f.id_ === this.buildingReferenceId);
      if (found) {
        selected_collection.push(found);
      }
    }

    selected_collection = this.selectVeryProbable.getFeatures();
    selected_collection.clear();

    if (
      this.displayVectors &&
      this.top_shot_id &&
      this.top_shot_id !== this.buildingReferenceId &&
      this.top_shot_id !== this.buildingReferenceIdPreselected
    ) {
      const found = this.features.find(f => f.id_ === this.top_shot_id);
      if (found) {
        selected_collection.push(found);
      }
    }

    selected_collection = this.selectProbable.getFeatures();
    selected_collection.clear();
    if (this.displayVectors && this.candidates_ids) {
      const ftrs = this.features.filter(
        f =>
          this.candidates_ids.includes(f.id_) &&
          f.id_ !== this.buildingReferenceId &&
          f.id_ !== this.buildingReferenceIdPreselected
      );
      if (ftrs) {
        ftrs.forEach(ftr => selected_collection.push(ftr));
      }
    }
  }

  toggleView() {
    this.displayVectors = !this.displayVectors;
    this.vectorLayer.setVisible(this.displayVectors);

    this.repaintCandidates();
  }

  selectApiSource(newSource) {
    const extras = {};
    if (newSource && newSource !== '') {
      extras['fragment'] = 'source=' + newSource;
    }
    this._router.navigate(['georeference', 'map', this.buildingId], extras);
    this.referenceSource = newSource;
    this.referenceToHuman();

    this.startData();
  }

  changeMap(data) {
    const newValue = `mapStyle=${data.target.value}`;
    this._router.navigate([], { fragment: newValue, relativeTo: this.route, replaceUrl: true });
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

  centerMap() {
    this.view.fit(this.vectorSource.getExtent(), {
      padding: paddingToBuildings,
      constrainResolution: false,
      nearest: false,
    });
  }

  /**
   * We navigate to the next batch or finish if there's none
   */
  nextBuilding() {
    if (this.layoutId && this.buildingFeature) {
      this.centerToPolygon(() => {
        document.body.style.cursor = '';
        const newValue = `mapStyle=${this.mapStyle}`;
        this._router.navigate(['georeference', 'building', this.layoutId], {
          fragment: newValue,
        });
      });
    } else {
      // We avoid wrong cursor before linking to other page
      document.body.style.cursor = '';

      const next = this.batchService.getNextLine();

      if (next !== null) {
        if (next.building && next.layout) {
          this._router.navigate(['georeference', 'map', next.building, next.layout], {
            replaceUrl: true,
          });
        } else if (next.building) {
          this._router.navigate(['georeference', 'map', next.building], {
            replaceUrl: true,
          });
        } else if (next.layout) {
          this._router.navigate(['georeference', 'layout', next.layout]);
        } else {
          this._router.navigate(['georeference']);
        }
      } else {
        this._router.navigate(['georeference']);
      }
    }
  }

  /**
   * We store the selection from the user (If he did select something)
   */
  confirmBuilding() {
    if (this.buildingReferenceId !== null) {
      if (!this.processEnded) {
        this.processEnded = true;

        const buildingNewValue = {
          building_references: [],
        };

        // We remove this source.
        buildingNewValue.building_references = buildingNewValue.building_references.filter(
          br => br.source !== 'source'
        );

        // The value has to be a string
        buildingNewValue.building_references.push({
          id: this.buildingReferenceId,
          source: this.referenceSource,
        });

        this.http.patch(apiUrl + 'buildings/' + this.buildingId, buildingNewValue).subscribe(
          element => {
            this.nextBuilding();
          },
          error => {
            this.error = `Error saving ${getBuildingLink(this.buildingId, this.building)}`;
            console.error(error);
          }
        );
      }
    }
  }

  /**
   * We make the building to be in the center.
   * @param onComplete
   */
  centerToPolygon(onComplete) {
    const polygon = /** @type {ol.geom.SimpleGeometry} */ (this.buildingFeature.getGeometry());

    // padding: paddingToBuilding,
    this.view.fit(polygon, {
      padding: paddingToBuilding,
      constrainResolution: false,
      nearest: false,
      duration: 1000,
    });

    setTimeout(() => {
      onComplete();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }
}
