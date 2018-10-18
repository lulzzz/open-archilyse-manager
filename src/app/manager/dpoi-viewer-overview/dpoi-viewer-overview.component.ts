import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiFunctions } from '../../_shared-libraries/ApiFunctions';
import { HttpClient } from '@angular/common/http';
import { parseParms } from '../../_shared-libraries/Url';
import { Subscription } from 'rxjs/Subscription';

import OlMap from 'ol/Map';
import OlTileLayer from 'ol/layer/Tile';
import OlVectorLayer from 'ol/layer/Vector';
import OlView from 'ol/View';
import Vector from 'ol/source/Vector';

import OlStyle from 'ol/style/Style';
import OlStyleStroke from 'ol/style/Stroke';

import OlFeature from 'ol/Feature';
import OlLineString from 'ol/geom/LineString';
import OlXYZ from 'ol/source/XYZ';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import { NavigationService } from '../../_services';
import { paddingToBuildings } from '../map-overview/map-overview.component';
import { environment } from '../../../environments/environment';

/**
 * We need the scale to be in meters
 */
const scaleLineControl = new ScaleLine();
scaleLineControl.setUnits('metric');

/**
 * Styling for the lines
 */
export const styleLine = new OlStyle({
  stroke: new OlStyleStroke({
    color: 'rgba(6, 143, 255, 0.5)',
    width: 10,
    lineCap: 'square',
  }),
});

@Component({
  selector: 'app-dpoi-viewer-overview',
  templateUrl: './dpoi-viewer-overview.component.html',
  styleUrls: ['./dpoi-viewer-overview.component.scss'],
})
export class DpoiViewerOverviewComponent implements OnInit, OnDestroy {
  /** String container of any error */
  generalError = null;

  /** True to start and false once all the data is loaded */
  loading = true;

  building;
  buildingId;
  simulations;

  /**
   * Map data
   */

  map: OlMap = null;
  source: OlXYZ;
  layer: OlTileLayer;

  detailLayer: OlVectorLayer;
  globalLayer: OlVectorLayer;

  detailSource;
  globalSource;

  view: OlView;

  /**
   * Mapbox Style selected
   * light, dark, outdoors, streets, satellite
   */
  mapStyle;
  mapVehicle = 'foot'; // 'bike', 'car'

  /**
   * Simulation data
   */

  created;
  updated;
  status;

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
      this.initComponent();
    });
  }

  ngOnInit() {}

  /**
   * Reset the component and load the data.
   * On init and on change profile
   */
  initComponent() {
    console.log('initComponent');

    this.loading = true;
    this.buildingId = this.route.snapshot.params['buildingId'];
    if (this.buildingId) {
      ApiFunctions.get(this.http, `buildings/${this.buildingId}`, building => {
        console.log('building', building);
        this.building = building;

        ApiFunctions.get(
          this.http,
          `buildings/${this.buildingId}/simulations`,
          simulations => {
            console.log('simulations', simulations);

            if (simulations && simulations.dpoi) {
              this.simulations = simulations;

              this.created = simulations.dpoi.created;
              this.updated = simulations.dpoi.updated;
              this.status = simulations.dpoi.status;

              this.setUpMap();
              this.loadSims();

              this.loading = false;
            } else {
              this.loading = false;
              this.generalError = `<div class="title"> DPOI simulation not found </div>`;
            }
          },
          error => {
            this.loading = false;
            this.generalError = `<div class="title">Unknown error requesting the API data: </div> ${
              error.message
            }`;
          }
        );
      });
    }
  }

  /**
   * We load the DPOI simulations
   */
  loadSims() {
    const simKeys = Object.keys(this.simulations.dpoi.result);
    const dpoiResult = this.simulations.dpoi.result;

    for (let i = 0; i < simKeys.length; i += 1) {
      const simKey = simKeys[i];
      if (simKey !== 'coordinates') {
        ApiFunctions.getPath(
          this.http,
          dpoiResult.coordinates,
          dpoiResult[simKey],
          this.mapVehicle,
          result => {
            const feature = new OlFeature({
              geometry: new OlLineString(result.paths[0].points.coordinates),
              name: 'Line',
            });
            // To recover the value
            feature.setId(this.building.building_id);
            feature.setStyle(styleLine);

            this.detailSource.addFeature(feature);

            this.centerMap();
          },
          error => {
            console.error('Path result error', error);
          }
        );
      }
    }
  }

  /**
   * We load the open Layers map
   */
  setUpMap() {
    console.log('setUpMap', this.map);
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
      });

      this.globalLayer = new OlVectorLayer({
        source: this.globalSource,
      });

      this.layer = new OlTileLayer({
        source: this.source,
      });

      this.view = new OlView({
        projection: 'EPSG:4326',
      });

      this.map = new OlMap({
        controls: defaultControls({
          zoom: false,
        }).extend([scaleLineControl]),
        target: 'map',
        layers: [this.layer, this.detailLayer, this.globalLayer],
        view: this.view,
      });

      this.view = this.map.getView();

      this.fragment_sub = this.route.fragment.subscribe(fragment => {
        const urlParams = parseParms(fragment);
        if (urlParams.hasOwnProperty('mapStyle')) {
          this.changeMapStyle(urlParams['mapStyle']);
        }
      });
    }
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

  /**
   * We change the vehicle and load the simulations (if value changed).
   * @param mapVehicle foot | bike | car
   */
  changeVehicle(mapVehicle) {
    // Only if we change
    if (this.mapVehicle !== mapVehicle) {
      this.mapVehicle = mapVehicle;
      this.loadSims();
    }
  }

  /** ********************************
   * Links
   */

  /** Link to display DPOI raw as a JSON object */
  seeRawData() {
    this.router.navigate([
      'manager',
      'simulation',
      'building',
      this.buildingId,
    ]);
  }

  /** Link to display DPOI in a table */
  seeTableView() {
    this.router.navigate(['manager', 'dpoi', this.buildingId]);
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
