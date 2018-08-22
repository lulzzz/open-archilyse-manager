import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from '../../../../node_modules/rxjs/Subscription';
import { ColumnDefinitions } from '../columnDefinitions';
import { CellRender } from '../cellRender';
import { HttpClient } from '../../../../node_modules/@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiFunctions } from '../apiFunctions';
import { ManagerFunctions } from '../managerFunctions';
import { GridOptions } from 'ag-grid';
import { urlPortfolio } from '../url';
import { columnDefs, columnDefsCompare } from './columnDefinitions';

@Component({
  selector: 'app-dpoi-overview',
  templateUrl: './dpoi-overview.component.html',
  styleUrls: ['./dpoi-overview.component.scss'],
})
export class DpoiOverviewComponent implements OnInit, OnDestroy {
  /**
   * TABLE DOCUMENTATION
   * https://www.ag-grid.com/angular-getting-started/
   */
  generalError = null;
  loading = true;

  buildingId;
  buildingIdCompare;

  selectedNodes = [];
  selectedRows = [];

  created;
  updated;
  status;

  /** Info for the compared DPOI */
  createdCompare;
  updatedCompare;
  statusCompare;

  gridApi;
  gridColumnApi;

  filterModelSet = false;

  gridOptions;

  fragment_sub: Subscription;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.buildingId = this.route.snapshot.params['buildingId'];
    this.buildingIdCompare = this.route.snapshot.params['buildingIdCompare'];

    if (this.buildingId) {
      ApiFunctions.get(
        this.http,
        `buildings/${this.buildingId}/simulations`,
        simulations => {
          if (simulations && simulations.dpoi) {
            this.created = simulations.dpoi.created;
            this.updated = simulations.dpoi.updated;
            this.status = simulations.dpoi.status;

            const result = simulations.dpoi.result;
            const simKeys = Object.keys(simulations.dpoi.result);

            let simulationsArray;

            if (this.buildingIdCompare) {
              ApiFunctions.get(
                this.http,
                `buildings/${this.buildingIdCompare}/simulations`,
                simulationsCompare => {
                  if (simulationsCompare && simulationsCompare.dpoi) {
                    this.createdCompare = simulationsCompare.dpoi.created;
                    this.updatedCompare = simulationsCompare.dpoi.updated;
                    this.statusCompare = simulationsCompare.dpoi.status;

                    const resultComapre = simulationsCompare.dpoi.result;

                    this.loading = false;

                    simulationsArray = simKeys.map(simKey => {
                      const res = result[simKey];
                      const resC = resultComapre[simKey];
                      return {
                        name: simKey,
                        category: this.getCategory(simKey),
                        bike: this.getDiffCat(res, resC, 'bike'),
                        car: this.getDiffCat(res, resC, 'car'),
                        flight: this.getDiffCat(res, resC, 'flight'),
                        foot: this.getDiffCat(res, resC, 'foot'),
                      };
                    });

                    this.prepareGrid(simulationsArray);
                  } else {
                    this.generalError = `<div class="title"> DPOI simulation for the compared building not found </div>`;
                  }
                },
                error => {
                  this.loading = false;
                  this.generalError = `<div class="title">Unknown error requesting the API data: </div> ${
                    error.message
                  }`;
                }
              );
            } else {
              this.loading = false;

              simulationsArray = simKeys.map(simKey => {
                const res = result[simKey];
                return {
                  name: simKey,
                  category: this.getCategory(simKey),
                  bike: res.bike,
                  car: res.car,
                  flight: res.flight,
                  foot: res.foot,
                  latitude: res.latitude,
                  longitude: res.longitude,
                };
              });

              this.prepareGrid(simulationsArray);
            }
          } else {
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
    }
  }

  getDiffCat(res, resC, catStr) {
    return {
      distance: this.getDiff(res, resC, catStr, 'distance'),
      duration: this.getDiff(res, resC, catStr, 'duration'),
      score: this.getDiff(res, resC, catStr, 'score'),
    };
  }

  getDiff(res, resC, catStr, attrStr) {
    const val = res && res[catStr] && res[catStr][attrStr] ? res[catStr][attrStr] : 0;
    const valC = resC && resC[catStr] && resC[catStr][attrStr] ? resC[catStr][attrStr] : 0;
    return val - valC;
  }

  prepareGrid(simulationsArray) {
    this.gridOptions = <GridOptions>{
      rowData: simulationsArray,
      columnDefs: this.buildingIdCompare ? columnDefsCompare : columnDefs,

      /** Pagination */
      ...ColumnDefinitions.pagination,
      ...ColumnDefinitions.columnOptions,

      onCellValueChanged: params => {
        ManagerFunctions.reactToEdit(this.http, params, 'site_id', 'sites', this.gridOptions.api);
      },

      onFilterChanged: params => {
        const model = params.api.getFilterModel();
        this.filterModelSet = model !== null && Object.keys(model).length > 0;
      },
      onSelectionChanged: () => {
        this.selectedNodes = this.gridOptions.api.getSelectedNodes();
        this.selectedRows = this.gridOptions.api.getSelectedRows();
      },
      onGridReady: params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        // this.gridOptions.api.sizeColumnsToFit();

        this.fragment_sub = ManagerFunctions.setDefaultFilters(
          this.route,
          this.buildingIdCompare ? columnDefsCompare : columnDefs,
          this.gridApi
        );
      },
    };
  }

  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }

  backPage() {
    window.history.back();
  }

  seeRawData() {
    window.location.href = `${urlPortfolio}/simulation/building/${this.buildingId}`;
  }

  viewDpoi(buildingId) {
    window.location.href = `${urlPortfolio}/dpoi/${buildingId}`;
  }

  getCategory(key) {
    const culture = 'Entertainment, Arts & Culture';
    const nature = 'Nature';
    const outdoor_category = 'Outdoor Facilities';
    const sustenance = 'Sustenance';
    const healthcare = 'Healthcare';
    const transportation_category = 'Transportation';
    const gear = 'Gear Shop';
    const foods = 'Fine Foods';
    const vegetation = 'Vegetation';
    const clothing = 'Clothing';
    const education = 'Education';
    const religion = 'Religion';
    const stores = 'General Store';
    const furniture_category = 'Furniture';
    const hardware_category = 'Hardware';
    const money = 'Money';
    const accommodation = 'Accommodation';

    const translate = {
      alcohol: foods,
      antiques: furniture_category,
      apartments: accommodation,
      art: culture,
      arts_centre: culture,
      atm: money,
      bakery: sustenance,
      bank: money,
      bar: sustenance,
      bathroom_furnishing: furniture_category,
      bbq: sustenance,
      beauty: clothing,
      bed: furniture_category,
      beverages: sustenance,
      bicycle: transportation_category,
      bicycle_parking: transportation_category,
      bicycle_rental: transportation_category,
      bicycle_repair_station: gear,
      books: education,
      boutique: clothing,
      bus_station: transportation_category,
      bus_stop: transportation_category,
      butcher: sustenance,
      cafe: sustenance,
      car: transportation_category,
      car_parts: gear,
      car_repair: gear,
      car_sharing: transportation_category,
      car_wash: transportation_category,
      carpet: furniture_category,
      cave_entrance: outdoor_category,
      chapel: religion,
      charging_station: transportation_category,
      chemist: '',
      chocolate: foods,
      church: religion,
      cinema: culture,
      civic: culture,
      clinic: healthcare,
      clothes: clothing,
      coffee: sustenance,
      college: education,
      commercial: clothing,
      community_centre: culture,
      computer: hardware_category,
      confectionery: clothing,
      convenience: sustenance,
      cosmetics: clothing,
      craft: stores,
      dairy: foods,
      dance: culture,
      deli: stores,
      dentist: healthcare,
      department_store: stores,
      detached: '',
      doctors: healthcare,
      doityourself: gear,
      drinking_water: foods,
      driving_school: education,
      electronics: hardware_category,
      erotic: stores,
      fabric: '',
      farm: outdoor_category,
      fashion: clothing,
      fast_food: foods,
      firepit: '',
      fitness_centre: healthcare,
      florist: stores,
      fountain: outdoor_category,
      fuel: transportation_category,
      furniture: furniture_category,
      garden: outdoor_category,
      garden_centre: outdoor_category,
      gift: stores,
      golf_course: outdoor_category,
      grassland: outdoor_category,
      greengrocer: sustenance,
      grit_bin: '',
      hackerspace: hardware_category,
      hairdresser: clothing,
      halt: transportation_category,
      hardware: hardware_category,
      hearing_aids: healthcare,
      hifi: hardware_category,
      horse_riding: outdoor_category,
      hospital: healthcare,
      hotel: accommodation,
      house: accommodation,
      ice_rink: outdoor_category,
      industrial: '',
      interior_decoration: furniture_category,
      jewelry: clothing,
      kindergarten: education,
      kiosk: stores,
      kitchen: furniture_category,
      library: education,
      mall: stores,
      medical_supply: healthcare,
      miniature_golf: outdoor_category,
      mobile_phone: '',
      motorcycle: transportation_category,
      motorcycle_parking: transportation_category,
      music: culture,
      music_school: education,
      musical_instrument: culture,
      nature_reserve: nature,
      nightclub: culture,
      nursing_home: healthcare,
      office: '',
      outdoor: outdoor_category,
      paint: culture,
      park: outdoor_category,
      parking: transportation_category,
      parking_entrance: transportation_category,
      parking_space: transportation_category,
      peak: nature,
      perfumery: clothing,
      pharmacy: healthcare,
      photo: '',
      picnic_table: outdoor_category,
      pitch: '',
      platform: transportation_category,
      playground: outdoor_category,
      pub: sustenance,
      residential: '',
      restaurant: sustenance,
      retail: '',
      saddle: outdoor_category,
      sand: nature,
      sauna: outdoor_category,
      school: education,
      scree: nature,
      scrub: vegetation,
      scuba_diving: outdoor_category,
      second_hand: clothing,
      sewing: clothing,
      shoes: clothing,
      social_facility: healthcare,
      sports: outdoor_category,
      sports_centre: outdoor_category,
      stadium: outdoor_category,
      station: transportation_category,
      stationery: '',
      stop_position: transportation_category,
      supermarket: stores,
      swimming_pool: outdoor_category,
      tailor: clothing,
      taxi: transportation_category,
      tea: sustenance,
      terrace: '',
      track: vegetation,
      train_station: transportation_category,
      transportation: transportation_category,
      tree: vegetation,
      university: education,
      veterinary: healthcare,
      warehouse: '',
      water: vegetation,
      water_park: outdoor_category,
      wetland: vegetation,
      wine: foods,
      wood: nature,
    };

    return translate[key] ? translate[key] : '';
  }

  /**
   * Export functions
   */
  export() {
    this.gridOptions.api.exportDataAsCsv({
      columnSeparator: ';',
    });
  }
  exportSelected() {
    this.gridOptions.api.exportDataAsCsv({
      onlySelected: true,
      columnSeparator: ';',
    });
  }
}
