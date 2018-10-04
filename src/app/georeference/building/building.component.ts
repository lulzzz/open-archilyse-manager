import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { paddingToBuilding, styleCurrent, styleNormalFaded } from '../data';

import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import OlVectorLayer from 'ol/layer/Vector';
import OlView from 'ol/View';
import OlFeature from 'ol/Feature';

import Vector from 'ol/source/Vector';
import Polygon from 'ol/geom/Polygon';
import GeoJSON from 'ol/format/GeoJSON';
import * as fromStore from '../../_store';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { BatchService, NavigationService, OverlayService } from '../../_services';
import { parseParms } from '../url';
import { HttpClient } from '@angular/common/http';
import { getBuildingLink, getLayoutLink, getUnitLink } from '../portfolioLinks';
import { environment } from '../../../environments/environment';

const apiUrl = environment.apiUrl;

@Component({
  selector: 'app-building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.scss'],
})
export class BuildingComponent implements OnInit, OnDestroy {
  /** Parameters for the editor */

  modelStructure = null;

  buildingPerimeter;
  buildingPerimeterScale;

  layoutId;
  layout;
  unitId;
  unit;
  buildingId;
  buildingReferenceId;
  building;
  buildingAddress = '';

  // Batch information
  nextBatch;
  hasNextBatch;

  geoJson;
  referenceSource = null;
  referenceSourceHumanStr;
  referenceCoordinates;

  loading;
  features;
  currentFeature;

  coords = null;
  previousCoords = null; // Selected previously by the user
  allPossibleCoords = null; // Backend sugestions

  map: OlMap;
  source: OlXYZ;
  layer: OlTileLayer;

  // Side buildings
  vectorLayer: OlVectorLayer;
  // Current building
  vectorLayerCurrent: OlVectorLayer;

  view: OlView;

  feature: OlFeature;
  featureCoordinates;

  // On window Resize, (We need to store it to unsubscribe later)
  windowListener;

  showPreview = false;
  previewImages = null;
  currentPreset;

  coordsToSave = null;

  error = null;

  mapStyle;

  previousMovements;
  previousMovementsCurrent;
  previousMovementsOthers;

  currentProfile;

  /**
   * ReferenceCoordinates
   */
  referenceX;
  referenceY;

  /**
   * Subscriptions
   */
  mod_sub: Subscription;
  fragment_sub: Subscription;
  params_sub: Subscription;

  constructor(
    private http: HttpClient,
    private store: Store<fromStore.AppState>,
    private route: ActivatedRoute,
    private _router: Router,
    private batchService: BatchService,
    private navigationService: NavigationService
  ) {
    navigationService.profile$.subscribe(newProfile => {
      this.currentProfile = newProfile;
    });
  }

  ngOnInit() {
    this.fragment_sub = this.route.fragment.subscribe(fragment => {
      const urlParams = parseParms(fragment);
      if (urlParams.hasOwnProperty('source')) {
        this.referenceSource = urlParams['source'];
      }

      this.params_sub = this.route.params.subscribe(params => {
        this.error = null;
        this.showPreview = false;
        this.previewImages = null;

        this.modelStructure = null;
        this.buildingAddress = '';

        this.coordsToSave = null;

        this.startData();
      });
    });

    this.startBasicData();
  }

  /**
   * Data started on init
   */
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

  /**
   * Request of all the data through the process:
   * startDataWithLayout()
   * startDataWithUnit()
   * startDataWithBuilding()
   * startDataWithFeatures()
   * startMapWithNoError()
   */
  startData() {
    this.layoutId = this.route.snapshot.params['layoutid'];

    if (this.referenceSource === null) {
      this.referenceSource = this.batchService.getSource();
      this.referenceToHuman();
    }

    this.referenceCoordinates = this.batchService.getCoordinates();

    this.hasNextBatch = this.batchService.hasNextLine();
    this.nextBatch = this.batchService.getLines();

    this.loading = true;

    // Empty map div
    document.getElementById('map').innerHTML = '';

    this.http.get(apiUrl + 'layouts/' + this.layoutId).subscribe(
      layout => {
        this.previousMovements = layout['movements'];

        if (!layout) {
          this.loading = false;
          this.error = `Layout ${getLayoutLink(this.layoutId, layout)} not found.`;
        } else if (!layout['unit_id']) {
          this.loading = false;
          this.error = `Layout ${getLayoutLink(this.layoutId, layout)} has no unit assigned.`;
        } else {
          this.layout = layout;
          this.unitId = layout['unit_id'];

          this.startDataWithLayout();
        }
      },
      error => {
        this.loading = false;
        this.error = `Layout ${getLayoutLink(this.layoutId)} not found.`;
      }
    );
  }

  /**
   * We have the layout, now we request the units.
   */
  startDataWithLayout() {
    this.http.get(apiUrl + 'units/' + this.unitId).subscribe(
      unit => {
        if (!unit) {
          this.loading = false;
          this.error = `Unit ${getUnitLink(
            this.unitId,
            unit
          )} not found for layout Layout ${getLayoutLink(this.layoutId, this.layout)}`;
        } else if (!unit['building_id']) {
          this.loading = false;
          this.error = `Unit ${getUnitLink(this.unitId, unit)} has no building assigned`;
        } else {
          this.unit = unit;
          this.buildingId = unit['building_id'];

          this.startDataWithUnit();
        }
      },
      error => {
        this.loading = false;
        this.error = `Unit ${getUnitLink(this.unitId)} not found for layout ${getLayoutLink(
          this.layoutId,
          this.layout
        )}.`;
      }
    );
  }

  /**
   * We have the layout and the units, now we request the building.
   */
  startDataWithUnit() {
    this.http.get(apiUrl + 'buildings/' + this.buildingId).subscribe(
      building => {
        if (!building) {
          this.error = `Building ${getBuildingLink(this.buildingId, building)} not found.`;
        } else {
          this.building = building;
          const address = building['address'];
          if (address) {
            const street = address.street ? address.street : '';
            const street_nr = address.street_nr ? address.street_nr : '';
            const postal_code = address.postal_code ? address.postal_code : '';
            const city = address.city ? address.city : '';
            const country = address.country ? address.country : '';

            this.buildingAddress = `${street} ${street_nr}, ${postal_code} ${city} - (${country}) `;
          }

          this.startDataWithBuilding();
        }
      },
      error => {
        this.loading = false;
        this.error = `Building ${getBuildingLink(this.buildingId)} not found for unit ${getUnitLink(
          this.unitId,
          this.unit
        )}, layout ${getLayoutLink(this.layoutId, this.layout)}.`;
      }
    );
  }

  referenceToHuman() {
    if (this.referenceSource === 'swiss_topo') {
      this.referenceSourceHumanStr = 'Swiss topo';
    } else if (this.referenceSource === 'open_street_maps') {
      this.referenceSourceHumanStr = 'Open street maps';
    }
  }

  /**
   * We have the layout, the units, and the building.
   * Now we request the surroundings
   */
  startDataWithBuilding() {
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

        this.previousMovementsCurrent = this.previousMovements.find(
          pM => pM.source === this.referenceSource
        );
        this.previousMovementsOthers = this.previousMovements.filter(
          pM => pM.source !== this.referenceSource
        );

        let buildingRefId = null;
        if (this.building['building_references']) {
          const br = this.building['building_references'].find(
            br => br.source === this.referenceSource
          );
          if (br && br.id) {
            buildingRefId = br.id;
          }
        }

        if (buildingRefId !== null) {
          this.buildingReferenceId = buildingRefId;

          this.geoJson = surroundings['geojson'];

          this.features = new GeoJSON().readFeatures(this.geoJson);
          if (this.features.length > 0) {
            this.startDataWithFeatures();
          } else {
            this.loading = false;
            this.error = `GeoJson for "${
              this.referenceSourceHumanStr
            }" has no feature list for layout ${getLayoutLink(this.layoutId, this.layout)}`;
          }
        } else {
          this.loading = false;
          this.error = `Building ${getBuildingLink(this.buildingId, this.building)}
                                      was not referenced for the source ${
                                        this.referenceSourceHumanStr
                                      }`;
        }
      },
      error => {
        this.loading = false;
        this.error = `Surroundings for building ${getBuildingLink(
          this.buildingId,
          this.building
        )} not found not found in ${this.referenceSourceHumanStr}.`;
      }
    );
  }

  /**
   * We have the layout, the units, and the building.
   * We have the surroundings and now we request the georeference proposals
   */
  startDataWithFeatures() {
    this.http
      .get(apiUrl + 'layouts/' + this.layoutId + '/georef_proposals?source=' + this.referenceSource)
      .subscribe(
        proposals => {
          const vectorSource = new Vector({
            features: this.features.filter(feature => feature.getId() !== this.buildingReferenceId),
          });

          this.currentFeature = this.features.filter(
            feature => feature.getId() === this.buildingReferenceId
          );

          if (this.currentFeature) {
            const vectorSourceCurrent = new Vector({
              features: this.currentFeature,
            });

            this.vectorLayer = new OlVectorLayer({
              source: vectorSource,
              style: styleNormalFaded,
            });

            this.vectorLayerCurrent = new OlVectorLayer({
              source: vectorSourceCurrent,
              style: styleCurrent,
            });

            this.layer = new OlTileLayer({
              source: this.source,
            });

            this.view = new OlView({
              projection: this.geoJson.crs.properties.name,
            });

            this.map = new OlMap({
              target: 'map',
              layers: [this.layer, this.vectorLayer, this.vectorLayerCurrent],
              view: this.view,
              interactions: [],
            });

            this.centerToPolygon();

            // No error so far
            if (this.error === null) {
              this.startMapWithNoError(proposals);
            }
          }
        },
        error => {
          this.loading = false;
          this.error = `Georeference proposals for layout ${getLayoutLink(
            this.layoutId,
            this.layout
          )} not found in ${this.referenceSourceHumanStr}.`;
        }
      );
  }

  /**
   * We have the layout, the units, and the building.
   * We have the surroundings and the georeference proposals
   * Now we set up the Map
   */
  startMapWithNoError(proposals) {
    this.fragment_sub = this.route.fragment.subscribe(fragment => {
      const urlParams = parseParms(fragment);
      if (urlParams.hasOwnProperty('mapStyle')) {
        this.changeMapStyle(urlParams['mapStyle']);
      }
    });

    this.loading = false;
    this.modelStructure = this.layout['model_structure'];

    this.map.once('postrender', () => {
      this.analyzePixels();
      this.windowListener = this.onWindowResize.bind(this);
      window.addEventListener('resize', this.windowListener, false);

      this.previousCoords = this.previousMovementsCurrent;

      if (proposals && proposals['movements']) {
        this.allPossibleCoords = proposals['movements'];

        if (this.previousCoords) {
          this.currentPreset = 'preselected';

          // By default the first option
          this.coords = this.previousCoords;
          this.coordsToSave = this.previousCoords;
        } else {
          this.currentPreset = 0;

          // By default the first option
          this.coords = this.allPossibleCoords[0];
          this.coordsToSave = this.allPossibleCoords[0];
        }
      } else {
        this.loading = false;
        this.error = `Georeference proposals for layout ${getLayoutLink(
          this.layoutId,
          this.layout
        )} not found in ${this.referenceSourceHumanStr}.`;
      }
    });
  }

  onWindowResize() {
    this.startData();
  }

  getBoundingBox(coordinates) {
    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxX = Number.MIN_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;

    coordinates.forEach(coordinate => {
      if (coordinate) {
        if (coordinate[0] < minX) {
          minX = coordinate[0];
        }
        if (coordinate[1] < minY) {
          minY = coordinate[1];
        }
        if (coordinate[0] > maxX) {
          maxX = coordinate[0];
        }
        if (coordinate[1] > maxY) {
          maxY = coordinate[1];
        }
      } else {
        console.error('Null coordinate', coordinate, coordinates);
      }
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  analyzePixels() {
    const coordinateArray = this.featureCoordinates[0];

    const perimeter = [];
    for (let i = 0; i < coordinateArray.length; i += 1) {
      const coor = coordinateArray[i];
      const pixel = this.map.getPixelFromCoordinate(coor); // new coordinate(coor));
      perimeter.push(pixel);
    }

    const box1 = this.getBoundingBox(perimeter);
    const box2 = this.getBoundingBox(coordinateArray);

    // TOP LEFT CORNER FROM THE MAP
    this.referenceX = box2.x + box2.width / 2;
    this.referenceY = box2.y + box2.height / 2;

    this.buildingPerimeterScale = box1.width / box2.width;
    this.buildingPerimeter = perimeter;
  }

  centerToPolygon() {
    this.feature = this.geoJson.features.find(feature => feature.id === this.buildingReferenceId);

    if (this.feature) {
      let polygon;
      if (this.feature.geometry.type === 'Polygon') {
        this.featureCoordinates = this.feature.geometry.coordinates;
        polygon = new Polygon(this.featureCoordinates);
      } else if (this.feature.geometry.type === 'MultiPolygon') {
        this.featureCoordinates = this.feature.geometry.coordinates[0];
        polygon = new Polygon(this.featureCoordinates);
      }

      this.view.fit(polygon, {
        padding: paddingToBuilding,
        constrainResolution: false,
        nearest: false,
      });

      /**
     duration: 1000,
     padding: paddingToBuilding
     */
    } else {
      this.error = `Georeferenced building (${this.buildingReferenceId}) not found.`;
    }
  }

  manualPreset(newCoords) {
    // The user changes manually the Coords.
    this.currentPreset = null;

    if (typeof newCoords.angle !== 'undefined') {
      this.coordsToSave.angle = newCoords.angle;
    }
    if (typeof newCoords.x_off !== 'undefined') {
      this.coordsToSave.x_off = newCoords.x_off;
    }
    if (typeof newCoords.y_off !== 'undefined') {
      this.coordsToSave.y_off = newCoords.y_off;
    }
  }

  preset(selected) {
    if (this.currentPreset === null) {
      this.coords = null;
    }
    this.currentPreset = selected;

    if (this.currentPreset === 'preselected') {
      setTimeout(() => {
        this.coords = this.previousCoords;
        this.coordsToSave = this.previousCoords;
      }, 10);
    } else {
      setTimeout(() => {
        this.coords = this.allPossibleCoords[selected];
        this.coordsToSave = this.allPossibleCoords[selected];
      }, 10);
    }
  }

  changeMap(data) {
    const newValue = `mapStyle=${data.target.value}`;
    this._router.navigate([], { fragment: newValue, relativeTo: this.route, replaceUrl: true });
  }

  selectApiSource(newSource) {
    const extras = {};
    if (newSource && newSource !== '') {
      extras['fragment'] = 'source=' + newSource;
    }
    this._router.navigate(['georeference', 'building', this.layoutId], extras);
    this.referenceSource = newSource;
    this.referenceToHuman();
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

  nextBuilding() {
    // Preview Images have to be reset.
    this.previewImages = null;
    this.showPreview = true;

    const next = this.batchService.getNextLine();
    if (next !== null) {
      if (next.building && next.layout) {
        this._router.navigate(['georeference', 'map', next.building, next.layout]);
      } else if (next.building) {
        this._router.navigate(['georeference', 'map', next.building]);
      } else if (next.layout) {
        this._router.navigate(['georeference', 'building', next.layout], {
          replaceUrl: true,
        });
      } else {
        this._router.navigate(['manager', 'layout']);
      }
    } else {
      this._router.navigate(['manager', 'layout']);
    }
  }

  /**
   * Finish edition, we stor the selected coordinates.
   */
  confirmCoordinates() {
    delete this.coordsToSave.z_pivot;

    const layoutNewValue = {
      movements: [
        {
          source: this.referenceSource,
          ...this.coordsToSave,
        },
        ...this.previousMovementsOthers,
      ],
    };

    /**
     * PATCH
     */
    this.http.patch(apiUrl + 'layouts/' + this.layoutId, layoutNewValue).subscribe(
      element => {
        this.nextBuilding();
      },
      error => {
        console.error(error);
        this.error = 'Unexpected error when saving the layout placement';
      }
    );
  }

  ngOnDestroy() {
    if (this.windowListener) {
      // Unsubscribe from window events
      window.removeEventListener('resize', this.windowListener);
    }

    if (this.mod_sub) {
      this.mod_sub.unsubscribe();
    }
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
    if (this.params_sub) {
      this.params_sub.unsubscribe();
    }
  }

  /**
   * Sitebar controls to display the sidebars.
   */
  openPreviews() {
    this.showPreview = true;
  }
  closePreviews() {
    this.showPreview = false;
  }

  /**
   * We provide this method to the app-geo-editor
   * Once the preview images are generated calls back with the image array.
   * We open the preview.
   * @param previews
   */
  processPreviews(previews) {
    this.previewImages = previews;
    setTimeout(() => {
      this.showPreview = true;
    }, 100);
  }
}
