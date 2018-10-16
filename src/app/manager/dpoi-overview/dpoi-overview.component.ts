import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import {
  ColumnDefinitions,
  columnDefs,
  columnDefsCompare,
} from '../../_shared-libraries/ColumnDefinitions';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiFunctions } from '../../_shared-libraries/ApiFunctions';
import { ManagerFunctions } from '../../_shared-libraries/ManagerFunctions';
import { exportOptions, exportSelectedOptions } from '../../_shared-libraries/ExcelManagement';
import { getCategory } from '../../_shared-libraries/DpoiCategories';
import { NavigationService } from '../../_services';

/**
 * Get the difference in a full category validating that attributes are defined
 * @param res - Values origin
 * @param resC - Values compare
 * @param catStr - Category string
 */
function getDiffCat(res, resC, catStr) {
  return {
    distance: getDiff(res, resC, catStr, 'distance'),
    duration: getDiff(res, resC, catStr, 'duration'),
    score: getDiff(res, resC, catStr, 'score'),
  };
}
/**
 * Get the difference in an attribute validating that is defined.
 * @param res - Values origin
 * @param resC - Values compare
 * @param catStr - Category string
 * @param attrStr - Attribute string
 */
function getDiff(res, resC, catStr, attrStr) {
  const val = res && res[catStr] && res[catStr][attrStr] ? res[catStr][attrStr] : 0;
  const valC = resC && resC[catStr] && resC[catStr][attrStr] ? resC[catStr][attrStr] : 0;
  return val - valC;
}

@Component({
  selector: 'app-dpoi-overview',
  templateUrl: './dpoi-overview.component.html',
  styleUrls: ['./dpoi-overview.component.scss'],
})
export class DpoiOverviewComponent implements OnInit, OnDestroy {
  /**
   * Loading and general error
   */

  generalError = null;
  loading = true;

  /**
   * TABLE DOCUMENTATION
   * https://www.ag-grid.com/angular-getting-started/
   * ag- grid parameters:
   */

  buildingId;
  buildingIdCompare;

  selectedNodes = [];
  selectedRows = [];

  gridApi;
  gridColumnApi;
  filterModelSet = false;
  gridOptions;

  /**
   * Local variables
   */

  created;
  updated;
  status;

  addressHelp = null;
  addressHelpCompare = null;

  /** Info for the compared DPOI */
  createdCompare;
  updatedCompare;
  statusCompare;

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

  initComponent() {
    this.loading = true;
    this.filterModelSet = false;

    this.buildingId = this.route.snapshot.params['buildingId'];
    this.buildingIdCompare = this.route.snapshot.params['buildingIdCompare'];

    if (this.buildingId) {
      ApiFunctions.get(this.http, `buildings/${this.buildingId}`, building => {
        const address = building['address'];
        const buildingName = building['name'] ? building['name'] : this.buildingId;
        if (address) {
          const street = address.street ? address.street : '';
          const street_nr = address.street_nr ? address.street_nr : '';
          const postal_code = address.postal_code ? address.postal_code : '';
          const city = address.city ? address.city : '';
          const country = address.country ? address.country : '';

          const addressStr = `${street} ${street_nr}, ${postal_code} ${city} - (${country}) `;
          this.addressHelp = `<span class="label-dpoi">Building "${buildingName}":</span> <span class="address-text">${addressStr}</span>`;
        } else {
          this.addressHelp = `Address not defined for building <span class="address-text">${buildingName}</span>`;
        }
      });

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
              ApiFunctions.get(this.http, `buildings/${this.buildingIdCompare}`, building => {
                const address = building['address'];
                const buildingName = building['name'] ? building['name'] : this.buildingId;
                if (address) {
                  const street = address.street ? address.street : '';
                  const street_nr = address.street_nr ? address.street_nr : '';
                  const postal_code = address.postal_code ? address.postal_code : '';
                  const city = address.city ? address.city : '';
                  const country = address.country ? address.country : '';

                  const addressStr = `${street} ${street_nr}, ${postal_code} ${city} - (${country}) `;
                  this.addressHelpCompare = `<span class="label-dpoi">Compared to "${buildingName}" :</span> <span class="address-text">${addressStr}</span>`;
                } else {
                  this.addressHelpCompare = `Address not defined for building <span class="address-text">${buildingName}</span>`;
                }
              });

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
                        category: getCategory(simKey, res && res.category ? res.category : ''),
                        category_original: res && res.category ? res.category : '',
                        place_name: res && res.name ? res.name : '',
                        place_name_compare: resC && resC.name ? resC.name : '',
                        bike: getDiffCat(res, resC, 'bike'),
                        car: getDiffCat(res, resC, 'car'),
                        flight: getDiffCat(res, resC, 'flight'),
                        foot: getDiffCat(res, resC, 'foot'),
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
                  category: getCategory(simKey, res && res.category ? res.category : ''),
                  category_original: res && res.category ? res.category : '',
                  place_name: res && res.name ? res.name : '',
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

  /**
   * Ag-grid parameters.
   * https://www.ag-grid.com/documentation-main/documentation.php
   * @param simulationsArray
   */
  prepareGrid(simulationsArray) {
    this.gridOptions = {
      rowData: simulationsArray,
      columnDefs: this.buildingIdCompare ? columnDefsCompare : columnDefs,

      /** Pagination */
      ...ColumnDefinitions.pagination,
      ...ColumnDefinitions.columnOptions,

      getRowNodeId: data => data.name,

      onFilterChanged: params => {
        const model = params.api.getFilterModel();
        this.filterModelSet = model !== null && Object.keys(model).length > 0;
      },
      onSelectionChanged: () => {
        if (this.gridOptions && this.gridOptions.api) {
          this.selectedNodes = this.gridOptions.api.getSelectedNodes();
          this.selectedRows = this.gridOptions.api.getSelectedRows();
        }
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

  /**
   * Links
   */

  seeRawData() {
    this.router.navigate(['manager', 'simulation', 'building', this.buildingId]);
  }
  seeMapView() {
    this.router.navigate(['manager', 'dpoiView', this.buildingId]);
  }

  viewDpoi(buildingId) {
    this.router.navigate(['manager', 'dpoi', buildingId]);
  }

  switchDpoi() {
    this.router.navigate(['manager', 'dpoi', this.buildingIdCompare, this.buildingId]);
  }

  clearFilters() {
    this.filterModelSet = false;
    this.gridApi.setFilterModel(null);
  }

  clearSelection() {
    ManagerFunctions.clearSelection(this.gridOptions.api);
  }

  /**
   * Export functions
   */

  export() {
    this.gridOptions.api.exportDataAsCsv(exportOptions);
  }
  exportSelected() {
    this.gridOptions.api.exportDataAsCsv(exportSelectedOptions);
  }
}
