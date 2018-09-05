import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ManagerFunctions } from '../managerFunctions';
import { Building, Site } from '../../_models';
import { ApiFunctions } from '../apiFunctions';
import { CellRender } from '../cellRender';
import { ColumnDefinitions } from '../columnDefinitions';
import {
  convertFileToWorkbook,
  exportOptions,
  exportSelectedOptions,
  getRows,
  showInfoExcel,
} from '../excel';
import { OverlayService } from '../../_services/overlay.service';
import { environment } from '../../../environments/environment';
const urlGeoreference = environment.urlGeoreference;
const urlPortfolio = environment.urlPortfolio;

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
  selector: 'app-building-overview',
  templateUrl: './building-overview.component.html',
  styleUrls: ['./building-overview.component.scss'],
})
export class BuildingOverviewComponent implements OnInit, OnDestroy {
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
  selectedNodes = [];
  selectedRows = [];

  gridApi;
  gridColumnApi;

  filterModelSet = false;
  gridOptions;
  columnDefs;

  /**
   * Local variables
   */

  sitesArray;

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

  /**
   * In order to provide dropdowns with site lists we need to build it after load.
   * @param sites
   */
  buildColumDefinitions(sites) {
    this.columnDefs = [
      {
        headerName: 'Site',
        headerTooltip: 'Parent site main properties',
        openByDefault: false,
        children: [
          {
            headerName: 'Site Id',
            field: 'site_id',
            width: 230,
            cellRenderer: CellRender.viewSiteOfBuilding,
            cellEditor: 'agPopupSelectCellEditor',
            cellEditorParams: {
              values: ['', ...sites.map(site => site.site_id)],
            },
            valueFormatter: CellRender.siteFormatter.bind(this),
            editable: true,
          },
          {
            headerName: 'Site Name',
            columnGroupShow: 'open',
            field: 'site_name',
            editable: false,
            cellClass: 'idCell',
          },
        ],
      },
      {
        headerName: 'Building',
        headerTooltip: 'Building entity main properties',
        openByDefault: true,
        children: [
          {
            headerName: 'Building Id',
            columnGroupShow: 'open',
            field: 'building_id',
            width: 190,
            editable: false,
            cellClass: 'idCell',
          },
          { headerName: 'Name', field: 'name', editable: true },
          {
            headerName: 'Description',
            columnGroupShow: 'open',
            field: 'description',
            editable: true,
          },
        ],
      },
      {
        headerName: 'Building Address',
        headerTooltip:
          'Address properties for the current building, necessary for the DPOI simulation and georefence operations',
        children: [
          {
            headerName: 'Country',
            columnGroupShow: 'open',
            field: 'address.country',
            editable: true,
          },
          {
            headerName: 'City',
            columnGroupShow: 'open',
            field: 'address.city',
            editable: true,
          },
          { headerName: 'Street', field: 'address.street', editable: true },
          { headerName: 'Street Nr', field: 'address.street_nr', width: 100, editable: true },
          { headerName: 'Postal Code', field: 'address.postal_code', width: 110, editable: true },
        ],
      },
      {
        headerName: 'Units',
        children: [
          {
            headerName: 'Units',
            field: 'units',
            filter: 'agNumberColumnFilter',
            width: 90,
            cellRenderer: CellRender.viewUnitsOfBuilding,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Layouts',
            field: 'layouts',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            width: 90,
            editable: false,
            cellClass: 'readOnly',
          },
        ],
      },
      {
        headerName: 'Georeference',
        children: [
          // { headerName: 'Building_reference', field: 'building_reference', editable: true },
          {
            headerName: 'Swiss topo',
            field: 'building_reference.swiss_topo',
            width: 265,
            cellRenderer: CellRender.viewGeorefBuildingST,
            editable: true,
          },
          {
            headerName: 'Open Street Maps',
            field: 'building_reference.open_street_maps',
            width: 150,
            cellRenderer: CellRender.viewGeorefBuildingOSM,
            editable: true,
          },
        ],
      },
      {
        headerName: 'Simulations',
        children: [
          {
            headerName: 'Potential view',
            field: 'simulations.potential_view.status',
            cellRenderer: 'simulationBuildingRenderer',
            cellStyle: { padding: '0px' },
            width: 140,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            headerName: 'Accoustics',
            field: 'simulations.accoustics.status',
            cellRenderer: 'simulationBuildingRenderer',
            cellStyle: { padding: '0px' },
            width: 140,
            editable: false,
            cellClass: 'readOnly',
          },
          {
            // cellRenderer: CellRender.viewSimulationBuilding,
            // cellRenderer: CellRender.viewSimulationBuilding,
            // cellRenderer: CellRender.viewSimulationDpoiBuilding,
            headerName: 'DPOI',
            field: 'simulations.dpoi.status',
            cellRenderer: 'simulationBuildingDpoiRenderer',
            cellStyle: { padding: '0px' },
            width: 140,
            editable: false,
            cellClass: 'readOnly',
          },
        ],
      },
      {
        headerName: 'Progress',
        children: [
          {
            headerName: 'Layouts',
            field: 'progressLayout',
            cellRenderer: 'procentRenderer',
            filter: 'agNumberColumnFilter',
            cellRendererParams: { editable: false },
            cellClass: 'readOnly',
          },
        ],
      },
      /**
      {
        headerName: 'Layout Simulations ',
        children: ColumnDefinitions.progressSimsLayout,
      },
      {
        headerName: 'Images',
        headerTooltip: 'Current Layout uploaded pictures',
        children: [
          {
            headerName: 'Images',
            field: 'images',
            cellRenderer: CellRender.viewImg,
            editable: false,
            cellClass: 'readOnly',
          },
        ],
      },
      */
      ...ColumnDefinitions.metaUserAndData,
    ];
  }

  buildingReactionToEdit(nodeData, element) {
    // if the new Layout has new unit id, we update the building data.
    if (element.site_id || element.site_id === '') {
      this.setBuildingSiteData(nodeData);
    }
  }
  setBuildingSiteData(building) {
    if (building.site_id || building.site_id === '') {
      const site = this.sitesArray.find(site => site.site_id === building.site_id);
      if (site) {
        building['site_name'] = site.name ? site.name : '';
      } else {
        building['site_name'] = '';
      }
    } else {
      building['site_name'] = '';
    }
  }

  ngOnInit() {
    /** BUILDINGS */
    ManagerFunctions.requestAllData(
      this.http,
      (sitesArray, buildingsArray, unitsArray, layoutsArray) => {
        this.sitesArray = sitesArray;
        this.loading = false;

        this.buildColumDefinitions(sitesArray);

        buildingsArray.forEach(building => {
          const progressResult = ManagerFunctions.progressOutOfBuildings(
            [building],
            unitsArray,
            layoutsArray
          );

          building.units = progressResult.numberOfUnits;
          building.layouts = progressResult.numberOfLayouts;
          building.progressLayout = progressResult.progressOfLayouts;

          this.buildingReactionToEdit(building, building);
        });

        this.gridOptions = {
          // <GridOptions>
          rowData: buildingsArray,
          columnDefs: this.columnDefs,

          /** Pagination */
          ...ColumnDefinitions.pagination,
          ...ColumnDefinitions.columnOptions,

          getRowNodeId: data => data.building_id,
          onCellValueChanged: params => {
            ManagerFunctions.reactToEdit(
              this.http,
              params,
              'building_id',
              'buildings',
              this.gridOptions.api,
              this.buildingReactionToEdit.bind(this)
            );
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
              this.columnDefs,
              this.gridApi
            );
          },
        };
      },
      error => {
        this.generalError = `<div class="title">Unknown error requesting the API data: </div> ${
          error.message
        }`;
      }
    );
  }

  clearSelection() {
    ManagerFunctions.clearSelection(this.gridOptions.api);
  }

  selectNotGeoreferenced() {
    this.gridOptions.api.selectAll();
    const nodes = this.gridOptions.api.getSelectedNodes();
    nodes.forEach(node => {
      if (ManagerFunctions.isReferencedBuilding(node.data)) {
        node.setSelected(false);
      }
    });
  }

  /**
   * Adds an empty building in the API
   */
  addRow() {
    const newBuilding = {
      address: {
        city: '', // St. Gallen
        country: '', // Switzerland
        postal_code: '', // 9000
        street: '', // Ruhbergstrasse
        street_nr: '', // 44
      },

      building_reference: {
        open_street_maps: '',
        swiss_topo: '',
      },
      description: '',
      images: '',
      name: '',
    };

    ApiFunctions.post(
      this.http,
      'buildings',
      newBuilding,
      building => {
        console.log('buildings', building);
        this.gridOptions.api.updateRowData({
          add: [building],
        });
      },
      ManagerFunctions.showErroruser
    );
  }

  /**
   * We duplicate the selected rows
   * Before that we remove the not needed attributes
   */
  duplicate() {
    this.selectedRows.forEach(selectedRow => {
      const newRow = {};
      Object.assign(newRow, ...selectedRow);

      // Id is not duplicated
      delete newRow['building_id'];

      // Calculated are not duplicated
      delete newRow['units'];
      delete newRow['layouts'];
      delete newRow['progressLayout'];

      // Control fields are not duplicated
      delete newRow['org_id'];
      delete newRow['user_id'];
      delete newRow['updated'];
      delete newRow['created'];

      ApiFunctions.post(
        this.http,
        'buildings',
        newRow,
        building => {
          this.gridOptions.api.updateRowData({
            add: [building],
          });
        },
        ManagerFunctions.showErroruser
      );
    });
  }

  /**
   * Deletes the selected rows in the API
   */
  delete() {
    let layouts = 0;
    let units = 0;

    this.selectedRows.forEach(site => {
      layouts += site.layouts;
      units += site.units;
    });

    let warning = null;
    if (units > 0) {
      let waringUnits;
      if (units > 1) {
        waringUnits = `There're ${units} units`;
      } else if (units === 1) {
        waringUnits = `There's an unit `;
      }

      let waringLayouts;
      if (layouts > 1) {
        waringLayouts = `${layouts} layouts`;
      } else if (layouts === 1) {
        waringLayouts = `a layout `;
      } else {
        waringLayouts = `no layouts `;
      }

      warning = `${waringUnits} and ${waringLayouts} associated.`;
    }

    ManagerFunctions.reactToDelete(
      this.http,
      this.selectedRows,
      this.gridOptions.api,
      'building',
      'buildings',
      'building_id',
      'buildings',
      warning
    );
  }

  georeferenceOSM() {
    this.georeference('open_street_maps');
  }

  georeference(src) {
    const nodes = this.gridOptions.api.getSelectedNodes();

    const numBuildings = nodes.length;
    let addressesCorrect = 0;
    nodes.forEach(node => {
      if (ManagerFunctions.isAddressCorrect(node.data)) {
        addressesCorrect += 1;
      }
    });

    if (addressesCorrect < numBuildings) {
      const withNoAdress = numBuildings - addressesCorrect;

      ManagerFunctions.showWarning(
        'Buildings with no address',
        withNoAdress === 1
          ? `There is a building in your selection that has not valid addresses.`
          : `There are ${withNoAdress} buildings in your selection that have not valid addresses.`,
        `Continue anyway`,
        confirmed => {
          if (confirmed) {
            this.geoRefBuildings(numBuildings, nodes, src);
          }
        }
      );
    } else {
      this.geoRefBuildings(numBuildings, nodes, src);
    }
  }

  geoRefBuildings(numBuildings, nodes, src) {
    if (numBuildings === 1) {
      const node = nodes[0];
      ManagerFunctions.openLink(
        urlGeoreference + '/map/' + node.data.building_id + (src ? `#source=${src}` : '')
      );
    } else if (numBuildings > 1) {
      const building_ids = nodes.map(node => node.data.building_id);
      const list = building_ids.join('\t\n') + '\t\n';
      ManagerFunctions.openLink(
        urlGeoreference + '/multiple#list=' + list + '' + (src ? `&source=${src}` : '')
      );
    }
  }

  clearFilters() {
    this.filterModelSet = false;
    this.gridApi.setFilterModel(null);
  }

  ngOnDestroy(): void {
    if (this.fragment_sub) {
      this.fragment_sub.unsubscribe();
    }
  }

  /**
   * startSimulations
   */
  getSimulationStatus() {
    const nodes = this.gridOptions.api.getSelectedNodes();
    nodes.forEach(node => {
      const building = node.data;
      console.log('get Building simulation status for ', building.building_id);
      ManagerFunctions.requestBuildingSimulationsStatus(this.http, building, this.gridOptions.api);
    });
  }

  compareDpoiSimulations() {
    const nodes = this.gridOptions.api.getSelectedNodes();
    if (nodes.length === 2) {
      if (nodes[0] && nodes[0].data && nodes[0].data.building_id) {
        if (nodes[1] && nodes[1].data && nodes[1].data.building_id) {
          const building_id1 = nodes[0].data.building_id;
          const building_id2 = nodes[1].data.building_id;
          ManagerFunctions.openLink(`${urlPortfolio}/dpoi/${building_id1}/${building_id2}`);
        } else {
          console.error('Second link wrong, ', nodes);
        }
      } else {
        console.error('First link wrong, ', nodes);
      }
    } else {
      console.error('Wrong number of links, ', nodes);
    }
  }

  startSimulations() {
    const nodes = this.gridOptions.api.getSelectedNodes();
    const buildings = nodes.map(node => node.data);

    const georefbuildings = buildings.filter(building =>
      ManagerFunctions.isReferencedBuilding(building)
    );

    if (georefbuildings.length !== buildings.length) {
      ManagerFunctions.showWarning(
        'Not Georeferenced buildings',
        `There are ${buildings.length -
          georefbuildings.length} buildings in your selection that are not georeferenced. Those buildings would be skipped.`,
        `Skip and continue`,
        confirmed => {
          if (confirmed) {
            this.startSimulationsViaBuildings(buildings);
          }
        }
      );
    } else {
      this.startSimulationsViaBuildings(buildings);
    }
  }

  startSimulationsViaBuildings(buildings) {
    buildings.forEach(building => {
      console.log('Start Building simulations for ', building.building_id);

      const simsRequested = [
        {
          name: 'potential_view',
          parameters: {
            floors: [1],
          },
        },
        {
          name: 'dpoi',
        },
      ]; // TODO: 'accoustics',
      ManagerFunctions.requestBuildingSimulations(
        this.http,
        building,
        simsRequested,
        this.gridOptions.api
      );
    });
  }

  /**
   * Import / Export functions
   */
  showInfoExcel() {
    this.infoDialog.open(showInfoExcel);
  }

  importExcel(files) {
    if (files.length === 1) {
      convertFileToWorkbook(files[0], result => {
        const dictionaryBuildings = {};

        dictionaryBuildings['Site Id'] = 'site_id';
        dictionaryBuildings['Building Id'] = 'building_id';
        dictionaryBuildings['Name'] = 'name';
        dictionaryBuildings['Description'] = 'description';

        // address
        dictionaryBuildings['Country'] = 'address.country';
        dictionaryBuildings['City'] = 'address.city';
        dictionaryBuildings['Street'] = 'address.street';
        dictionaryBuildings['Street Nr'] = 'address.street_nr';
        dictionaryBuildings['Postal Code'] = 'address.postal_code';

        // building_reference
        dictionaryBuildings['Swiss topo'] = 'building_reference.swiss_topo';
        dictionaryBuildings['Open Street Maps'] = 'building_reference.open_street_maps';

        // Images
        dictionaryBuildings['Images'] = 'images';

        const allRows = getRows(result, dictionaryBuildings);

        allRows.forEach(oneRow => {
          if (oneRow.building_id && oneRow.building_id !== null && oneRow.building_id !== '') {
            const building_id = oneRow.building_id;
            delete oneRow.building_id;
            ApiFunctions.patch(
              this.http,
              'buildings/' + building_id,
              oneRow,
              building => {
                const node = this.gridOptions.api.getRowNode(building_id);
                node.setData(building);
              },
              ManagerFunctions.showErrorUserNoReload
            );
          } else {
            ApiFunctions.post(
              this.http,
              'buildings',
              oneRow,
              building => {
                this.gridOptions.api.updateRowData({
                  add: [building],
                });
              },
              ManagerFunctions.showErrorUserNoReload
            );
          }
        });
      });
    }
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
