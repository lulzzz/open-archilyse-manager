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
    let val = res && res[catStr] && res[catStr][attrStr] ? res[catStr][attrStr] : 0;
    let valC = resC && resC[catStr] && resC[catStr][attrStr] ? resC[catStr][attrStr] : 0;
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
    const outdoor = 'Outdoor Facilities';
    const sustenance = 'Sustenance';
    const healthcare = 'Healthcare';
    const transportation = 'Transportation';
    const gear = 'Gear Shop';
    const foods = 'Fine Foods';
    const vegetation = 'Vegetation';
    const clothing = 'Clothing';
    const education = 'Education';
    const religion = 'Religion';
    const stores = 'General Store';
    const furniture = 'Furniture';
    const hardware = 'Hardware';
    const money = 'Money';
    const accommodation = 'Accommodation';

    const translate = {
      alcohol: foods,
      antiques: furniture,
      apartments: accommodation,
      art: culture,
      arts_centre: culture,
      atm: money,
      bakery: sustenance,
      bank: money,
      bar: sustenance,
      bathroom_furnishing: furniture,
      bbq: sustenance,
      beauty: clothing,
      bed: furniture,
      beverages: sustenance,
      bicycle: transportation,
      bicycle_parking: transportation,
      bicycle_rental: transportation,
      bicycle_repair_station: gear,
      books: education,
      boutique: clothing,
      bus_station: transportation,
      bus_stop: transportation,
      butcher: sustenance,
      cafe: sustenance,
      car: transportation,
      car_parts: gear,
      car_repair: gear,
      car_sharing: transportation,
      car_wash: transportation,
      carpet: furniture,
      cave_entrance: outdoor,
      chapel: religion,
      charging_station: transportation,
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
      computer: hardware,
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
      electronics: hardware,
      erotic: stores,
      fabric: '',
      farm: outdoor,
      fashion: clothing,
      fast_food: foods,
      firepit: '',
      fitness_centre: healthcare,
      florist: stores,
      fountain: outdoor,
      fuel: transportation,
      furniture: furniture,
      garden: outdoor,
      garden_centre: outdoor,
      gift: stores,
      golf_course: outdoor,
      grassland: outdoor,
      greengrocer: sustenance,
      grit_bin: '',
      hackerspace: hardware,
      hairdresser: clothing,
      halt: transportation,
      hardware: hardware,
      hearing_aids: healthcare,
      hifi: hardware,
      horse_riding: outdoor,
      hospital: healthcare,
      hotel: accommodation,
      house: accommodation,
      ice_rink: outdoor,
      industrial: '',
      interior_decoration: furniture,
      jewelry: clothing,
      kindergarten: education,
      kiosk: stores,
      kitchen: furniture,
      library: education,
      mall: stores,
      medical_supply: healthcare,
      miniature_golf: outdoor,
      mobile_phone: '',
      motorcycle: transportation,
      motorcycle_parking: transportation,
      music: culture,
      music_school: education,
      musical_instrument: culture,
      nature_reserve: nature,
      nightclub: culture,
      nursing_home: healthcare,
      office: '',
      outdoor: outdoor,
      paint: culture,
      park: outdoor,
      parking: transportation,
      parking_entrance: transportation,
      parking_space: transportation,
      peak: nature,
      perfumery: clothing,
      pharmacy: healthcare,
      photo: '',
      picnic_table: outdoor,
      pitch: '',
      platform: transportation,
      playground: outdoor,
      pub: sustenance,
      residential: '',
      restaurant: sustenance,
      retail: '',
      saddle: outdoor,
      sand: nature,
      sauna: outdoor,
      school: education,
      scree: nature,
      scrub: vegetation,
      scuba_diving: outdoor,
      second_hand: clothing,
      sewing: clothing,
      shoes: clothing,
      social_facility: healthcare,
      sports: outdoor,
      sports_centre: outdoor,
      stadium: outdoor,
      station: transportation,
      stationery: '',
      stop_position: transportation,
      supermarket: stores,
      swimming_pool: outdoor,
      tailor: clothing,
      taxi: transportation,
      tea: sustenance,
      terrace: '',
      track: vegetation,
      train_station: transportation,
      transportation: transportation,
      tree: vegetation,
      university: education,
      veterinary: healthcare,
      warehouse: '',
      water: vegetation,
      water_park: outdoor,
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
