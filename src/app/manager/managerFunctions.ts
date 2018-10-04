import swal from 'sweetalert2';
import { parseParms } from './url';
import { Building, Layout, Site, Unit } from '../_models';
import { ApiFunctions } from './apiFunctions';

function _capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export class ManagerFunctions {
  public static getName(array, id, idKey) {
    const found = array.find(element => element[idKey] === id);
    if (found) {
      if (found.name) {
        return found.name;
      } else if (found.address && found.address.street && found.address.street_nr) {
        return `${found.address.street} ${found.address.street_nr}`;
      }
    }
    return id;
  }

  public static calculateHumanFilters(
    data,
    filterModelSet,
    sitesArray,
    buildingsArray,
    unitsArray,
    layoutsArray
  ) {
    if (filterModelSet) {
      if (
        data['address.country'] &&
        data['address.country'].type &&
        data['address.country'].type === 'equals'
      ) {
        return `<label>Filtering by country: </label> <span class="whiteText" >${_capitalizeFirstLetter(
          data['address.country'].filter
        )}</span>`;
      } else if (data['country'] && data['country'].type && data['country'].type === 'equals') {
        return `<label>Filtering by country: </label> <span class="whiteText" >${_capitalizeFirstLetter(
          data['country'].filter
        )}</span>`;
      } else if (
        data['address.city'] &&
        data['address.city'].type &&
        data['address.city'].type === 'equals'
      ) {
        return `<label>Filtering by city: </label> <span class="whiteText" >${_capitalizeFirstLetter(
          data['address.city'].filter
        )}</span>`;
      } else if (data['city'] && data['city'].type && data['city'].type === 'equals') {
        return `<label>Filtering by city: </label> <span class="whiteText" >${_capitalizeFirstLetter(
          data['city'].filter
        )}</span>`;
      } else if (data.site_id && data.site_id.type && data.site_id.type === 'equals') {
        return `<label>Filtering site:</label> <span class="whiteText" >${ManagerFunctions.getName(
          sitesArray,
          data.site_id.filter,
          'site_id'
        )}</span>`;
      } else if (data.building_id && data.building_id.type && data.building_id.type === 'equals') {
        return `<label>Filtering building:</label> <span class="whiteText" >${ManagerFunctions.getName(
          buildingsArray,
          data.building_id.filter,
          'building_id'
        )}</span>`;
      } else if (data.unit_id && data.unit_id.type && data.unit_id.type === 'equals') {
        return `<label>Filtering unit:</label> <span class="whiteText" >${ManagerFunctions.getName(
          unitsArray,
          data.unit_id.filter,
          'unit_id'
        )}</span>`;
      } else if (data.layout_id && data.layout_id.type && data.layout_id.type === 'equals') {
        return `<label>Filtering layout:</label> <span class="whiteText" >${ManagerFunctions.getName(
          layoutsArray,
          data.layout_id.filter,
          'layout_id'
        )}</span>`;
      }
      return `<label>Filter set</label>`;
    }
    return null;
  }

  /**
   * TOOLS
   */
  public static requestBuildingSimulations(http, building, simsRequested, api) {
    ApiFunctions.post(
      http,
      'buildings/' + building.building_id + '/simulations',
      {
        simulation_packages: simsRequested,
      },
      result => {
        console.log('startSimulationsViaBuildings - result', result);

        if (!building['simulation_statuses']) {
          building['simulation_statuses'] = {};
        }
        simsRequested.forEach(sim => {
          if (!building['simulation_statuses'][sim.name]) {
            building['simulation_statuses'][sim.name] = {};
          }
          building['simulation_statuses'][sim.name].status = 'pending';
        });

        console.log('building', building);

        const node = api.getRowNode(building.building_id);
        node.setData(building);
      },
      ManagerFunctions.showErroruser
    );
  }
  public static requestBuildingSimulationsStatus(http, building, api) {
    ApiFunctions.get(
      http,
      'buildings/' + building.building_id + '/simulations/status',
      result => {
        console.log('Sim status finish', result);
        building['simulation_statuses'] = result;
        const node = api.getRowNode(building.building_id);
        node.setData(building);
      },
      error => {
        console.error(error);
      }
    );
  }

  public static requestLayoutSimulations(http, layout, simsRequested, api) {
    ApiFunctions.post(
      http,
      'layouts/' + layout.layout_id + '/simulations',
      {
        simulation_packages: simsRequested,
      },
      result => {
        if (!layout['simulation_statuses']) {
          layout['simulation_statuses'] = {};
        }
        simsRequested.forEach(sim => {
          if (!layout['simulation_statuses'][sim.name]) {
            layout['simulation_statuses'][sim.name] = {};
          }
          layout['simulation_statuses'][sim.name].status = 'pending';
        });

        const node = api.getRowNode(layout.layout_id);
        node.setData(layout);
      },
      ManagerFunctions.showErroruser
    );
  }

  public static requestLayoutSimulationsStatus(http, layout, api) {
    ApiFunctions.get(
      http,
      'layouts/' + layout.layout_id + '/simulations/status',
      result => {
        layout['simulation_statuses'] = result;
        const node = api.getRowNode(layout.layout_id);
        node.setData(layout);
      },
      error => {
        console.error(error);
      }
    );
  }

  public static isAddressCorrect(building) {
    return (
      building &&
      building.address &&
      building.address.city &&
      building.address.country &&
      // optional:: building.address.postal_code &&
      building.address.street &&
      building.address.street_nr
    );
  }

  public static getCountry(building) {
    return building.address && building.address.country ? building.address.country : '';
  }
  public static getCity(building) {
    return building.address && building.address.city ? building.address.city : '';
  }

  public static progressOutOfBuildings(buildingsList, unitsArray, layoutsArray) {
    const numBuildings = buildingsList.length;
    const buildingsReferenced = buildingsList.filter(building =>
      ManagerFunctions.isReferencedBuilding(building)
    );

    const numBuildingsReferenced = buildingsReferenced.length;

    const buildingsThisCountryIds = buildingsList.map(b => b.building_id);
    const unitsThisCountry = unitsArray.filter(unit =>
      buildingsThisCountryIds.includes(unit.building_id)
    );

    const unitsThisCountryIds = unitsThisCountry.map(b => b.unit_id);
    const layoutsThisCountry = layoutsArray.filter(layout =>
      unitsThisCountryIds.includes(layout.unit_id)
    );

    const layoutsReferenced = layoutsThisCountry.filter(layout =>
      ManagerFunctions.isReferencedLayout(layout)
    );

    const numUnits = unitsThisCountry.length;
    const numLayouts = layoutsThisCountry.length;
    const numLayoutsReferenced = layoutsReferenced.length;

    const progressBuildings = numBuildings > 0 ? numBuildingsReferenced * 100 / numBuildings : 0;

    const progressLayouts = numLayouts > 0 ? numLayoutsReferenced * 100 / numLayouts : 0;

    return {
      numberOfBuildings: numBuildings,
      numberOfUnits: numUnits,
      numberOfLayouts: numLayouts,
      progressOfBuildings: progressBuildings,
      progressOfLayouts: progressLayouts,
    };
  }

  /**
   * We check that the building has the building reference in swiss_topo or open_street_maps
   * @param building
   */
  public static isReferencedBuilding(building: Building): boolean {
    return (
      ManagerFunctions.isReferencedOSMBuilding(building) ||
      ManagerFunctions.isReferencedSTBuilding(building)
    );
  }

  public static isReferencedOSMBuilding(building: Building): boolean {
    // Swiss open_street_maps is defined
    if (building && building.building_references) {
      const ref = building.building_references.find(
        ref => ref.source === 'open_street_maps' && ref.id !== null && ref.id !== ''
      );

      return ref && ref.id !== '';
    }

    return false;
  }

  public static isReferencedSTBuilding(building: Building): boolean {
    // Swiss topo is defined
    if (building && building.building_references) {
      const ref = building.building_references.find(
        ref => ref.source === 'swiss_topo' && ref.id !== null && ref.id !== ''
      );

      return ref && ref.id !== '';
    }

    return false;
  }

  /**
   * We check that the layout has at least one movement in the list
   * @param layout
   */
  public static isReferencedLayout(layout: Layout) {
    return layout && layout.movements && layout.movements.length > 0;
  }

  public static isDigitalizedLayout(layout: Layout) {
    return !!(
      layout &&
      layout.model_structure &&
      layout.model_structure['floors'] &&
      layout.model_structure['floors'].length
    ); // At least 1 floor
  }

  public static requestAllData(httpService, onComplete, onError) {
    /**
    Observable.forkJoin([

    ]).subscribe(data => {});
   */
    ApiFunctions.get(
      httpService,
      'layouts',
      layouts => {
        const layoutsArray = <Layout[]>layouts;
        ApiFunctions.get(
          httpService,
          'units',
          units => {
            const unitsArray = <Unit[]>units;
            ApiFunctions.get(
              httpService,
              'buildings',
              buildings => {
                const buildingsArray = <Building[]>buildings;
                ApiFunctions.get(
                  httpService,
                  'sites',
                  sites => {
                    const sitesArray = <Site[]>sites;
                    onComplete(sitesArray, buildingsArray, unitsArray, layoutsArray);
                  },
                  onError
                );
              },
              onError
            );
          },
          onError
        );
      },
      onError
    );
  }

  public static openLink(url) {
    location.assign(encodeURI(url));
  }

  public static clearSelection(gridApi) {
    const nodes = gridApi.getSelectedNodes();
    nodes.forEach(node => node.setSelected(false));
  }

  public static setDefaultFilters(route, columnDefs, gridApi) {
    return route.fragment.subscribe(fragment => {
      const urlParams = parseParms(fragment);

      const model = {};
      Object.keys(urlParams).forEach(key => {
        columnDefs.forEach(group => {
          const found = group.children.find(columnDef => columnDef.field === key);
          if (found) {
            model[key] = {
              filter: urlParams[key],
              filterType: 'text',
              type: 'equals',
            };
          }
        });
      });
      gridApi.setFilterModel(model);
    });
  }

  /**
   * REACTIONS TO EVENTS
   */

  public static reactToDelete(
    httpService,
    selectedRows,
    gridApi,
    singular,
    plural,
    key,
    route,
    warning
  ) {
    let titleVal;
    let textVal;
    let confirmButtonTextVal;

    if (selectedRows.length <= 1) {
      titleVal = `Delete this ${singular}?`;
      textVal = `This action cannot be undone. Are you sure you want to delete this ${singular}?`;
      confirmButtonTextVal = 'Yes, delete it';
    } else {
      titleVal = `Delete these ${selectedRows.length} ${plural}?`;
      textVal = `This action cannot be undone. Are you sure you want to delete these ${plural}?`;
      confirmButtonTextVal = 'Yes, delete them';
    }

    if (warning !== null) {
      textVal = `${textVal} ${warning}`;
    }

    swal({
      title: titleVal,
      text: textVal,
      showCancelButton: true,
      confirmButtonText: confirmButtonTextVal,
      customClass: 'arch',
    }).then(result => {
      if (result.value) {
        selectedRows.forEach(selectedRow => {
          const elementKey = selectedRow[key];

          ApiFunctions.delete(httpService, route + '/' + elementKey, elements => {
            console.log(`DELETE ${plural}`, elements, elementKey);
          });
        });

        gridApi.updateRowData({
          remove: selectedRows,
        });
      }
    });
  }

  public static showErroruser(error) {
    ManagerFunctions.showWarning('Unexpected error', error.message, 'Ok', () => {
      location.reload();
    });
  }
  public static showErrorUserNoReload(error) {
    ManagerFunctions.showWarning('Unexpected error', error.message, 'Ok', () => {});
  }

  public static showWarning(titleVal, textVal, confirmButtonTextVal, onResult) {
    swal({
      title: titleVal,
      text: textVal,
      showCancelButton: true,
      confirmButtonText: confirmButtonTextVal,
      customClass: 'arch',
    }).then(result => {
      onResult(result.value);
    });
  }

  public static patchElement(httpService, node, url, newValue, gridApi, extraReaction?, onError?) {
    ApiFunctions.patch(
      httpService,
      url,
      newValue,
      element => {
        // Side elements updated after the request
        if (element.user_id) {
          node.data['user_id'] = element.user_id;
        }
        if (element.created) {
          node.data['created'] = element.created;
        }
        if (element.update) {
          node.data['update'] = element.update;
        }
        if (extraReaction) {
          extraReaction(node.data, element);
        }

        gridApi.updateRowData({
          update: [node.data],
        });
      },
      onError
    );
  }

  public static changeValueByColumnStr(object, columnName, columnValue) {
    const columnParts = columnName.split('.');
    if (columnParts.length <= 1) {
      object[columnName] = columnValue;
    } else if (columnParts.length <= 2) {
      if (!object[columnParts[0]]) {
        object[columnParts[0]] = {};
      }
      object[columnParts[0]][columnParts[1]] = columnValue;
    } else if (columnParts.length <= 3) {
      if (!object[columnParts[0]]) {
        object[columnParts[0]] = {};
      }
      if (!object[columnParts[0]][columnParts[1]]) {
        object[columnParts[0]][columnParts[1]] = {};
      }
      object[columnParts[0]][columnParts[1]][columnParts[2]] = columnValue;
    }
  }

  public static reactToEdit(httpService, params, key, route, gridApi, extraReaction?) {
    const element = params.data;
    const elementKey = element[key];

    const node = params.node;

    const column = params.column.colId;
    let columnValue = params.value;

    // TODO: API should understand null
    if (columnValue === null) {
      columnValue = '';
    }

    if (column === 'height') {
      columnValue = parseFloat(columnValue);
    } else if (column === 'number_of_floors') {
      columnValue = parseInt(columnValue, 10);
    }

    const newValue = {};
    ManagerFunctions.changeValueByColumnStr(newValue, column, columnValue);

    const url = route + '/' + elementKey;
    ManagerFunctions.patchElement(httpService, node, url, newValue, gridApi, extraReaction);
  }
}
