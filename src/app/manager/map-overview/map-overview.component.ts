import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../managerFunctions';

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

import condition from 'ol/events/condition';
import Select from 'ol/interaction/select';

import { apiUrl, urlPortfolio } from '../url';

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
    if (this[i] === v) return true;
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
  selector: 'app-map-overview',
  templateUrl: './map-overview.component.html',
  styleUrls: ['./map-overview.component.scss'],
})
export class MapOverviewComponent implements OnInit {
  /**
   * TABLE DOCUMENTATION
   * https://www.ag-grid.com/angular-getting-started/
   */

  buildingsArray;

  numGeoreferencedBuildings = 0;

  map: OlMap = null;
  source: OlXYZ;
  layer: OlTileLayer;
  vectorLayer: OlVectorLayer;
  vectorSource;
  view: OlView;

  selectPointerClick;
  selectPointerMove;

  mapStyle;

  generalError = null;
  loading = true;

  fragment_sub: Subscription;

  cities = [];
  countries = [];

  filterCountry = null;
  filterCity = null;

  constructor(private http: HttpClient) {}

  filterByCountry(country) {
    console.log('country', country);
    this.filterCountry = country;
    this.setUpMap();
  }

  filterByCity(city) {
    console.log('city', city);
    this.filterCity = city;
    this.setUpMap();
  }

  ngOnInit() {
    this.start();
  }

  start() {
    ManagerFunctions.requestAllData(
      this.http,
      (sitesArray, buildingsArray, unitsArray, layoutsArray) => {
        this.loading = false;

        this.buildingsArray = buildingsArray;

        this.cities = buildingsArray.map(building => building.address.city).unique();
        this.countries = buildingsArray.map(building => building.address.country).unique();

        this.setUpMap();
      },
      error => {
        this.generalError = `<div class="title">Unknown error requesting the API data: </div> ${
          error.message
        }`;
      }
    );
  }

  setUpMap() {
    this.map = null;
    this.numGeoreferencedBuildings = 0;

    // Empty map div
    document.getElementById('map').innerHTML = '';

    this.buildingsArray.forEach(building => {
      /** Filtering */
      if (!building || !building.address) {
        return false;
      }
      if (this.filterCountry !== null && building.address.country !== this.filterCountry) {
        return false;
      }
      if (this.filterCity !== null && building.address.city !== this.filterCity) {
        return false;
      }
      if (!building['building_reference']) {
        return false;
      }

      let referenced = null;
      let map_source = null;
      if (building['building_reference']['swiss_topo']) {
        map_source = 'swiss_topo';
        referenced = building['building_reference']['swiss_topo'];
      } else if (building['building_reference']['open_street_maps']) {
        map_source = 'open_street_maps';
        referenced = building['building_reference']['open_street_maps'];
      }

      if (referenced !== null) {
        this.http
          .get(apiUrl + 'buildings/' + building.building_id + '/surroundings', {
            params: {
              source: map_source,
            },
          })
          .subscribe(surroundings => {
            const features = new GeoJSON().readFeatures(surroundings['geojson']);
            if (features.length > 0) {
              const feature = features.find(feature => feature.id_ === referenced);

              if (feature) {
                this.numGeoreferencedBuildings += 1;
                if (this.map !== null) {
                  this.vectorSource.addFeature(feature);
                } else {
                  this.mapStyle = 'satellite';

                  this.source = new OlXYZ({
                    url:
                      'https://api.tiles.mapbox.com/v4/mapbox.' +
                      this.mapStyle +
                      '/{z}/{x}/{y}.png?' +
                      'access_token=***REMOVED***',
                  });

                  this.vectorSource = new Vector({
                    features: [feature],
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
                      //localhost:4200/manager/building#site_id=5b7d5793ed37e50009414a1a
                      // urlPortfolio/building#site_id=5b7d5793ed37e50009414a1a
                      window.location.href = `${urlPortfolio}/building#building_reference.open_street_maps=${
                        e.selected[0].id_
                      }`;
                    }
                  });
                }
                this.centerMap();
              }
            }
          });
      }
    });
  }

  centerMap() {
    this.view.fit(this.vectorSource.getExtent(), {
      padding: paddingToBuildings,
      constrainResolution: false,
      nearest: false,
    });
  }

  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }
}
