import swal from 'sweetalert2';
import { parseParms } from './url';
import { Building, Layout, Site, Unit } from '../_models';
import { ApiFunctions } from './apiFunctions';

export class ManagerFunctions {
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

        if (!building['simulations']) {
          building['simulations'] = {};
        }
        simsRequested.forEach(sim => {
          if (!building['simulations'][sim.name]) {
            building['simulations'][sim.name] = {};
          }
          building['simulations'][sim.name].status = 'pending';
        });

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

        building['simulations'] = result;
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
        console.log('startSimulationsViaLayouts - result', result);

        if (!layout['simulations']) {
          layout['simulations'] = {};
        }
        simsRequested.forEach(sim => {
          if (!layout['simulations'][sim]) {
            layout['simulations'][sim] = {};
          }
          layout['simulations'][sim].status = 'pending';
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
        layout['simulations'] = result;
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
  public static isReferencedBuilding(building: Building) {
    return (
      ManagerFunctions.isReferencedOSMBuilding(building) ||
      ManagerFunctions.isReferencedSTBuilding(building)
    );
  }

  public static isReferencedOSMBuilding(building: Building) {
    // Swiss open_street_maps is defined
    return (
      building &&
      building.building_reference &&
      building.building_reference.open_street_maps &&
      building.building_reference.open_street_maps !== ''
    );
  }

  public static isReferencedSTBuilding(building: Building) {
    // Swiss topo is defined
    return (
      building &&
      building.building_reference &&
      building.building_reference.swiss_topo &&
      building.building_reference.swiss_topo !== ''
    );
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
      object[columnParts[0]] = {};
      object[columnParts[0]][columnParts[1]] = columnValue;
    } else if (columnParts.length <= 3) {
      object[columnParts[0]] = {};
      object[columnParts[0]][columnParts[1]] = {};
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

    const newValue = {};
    ManagerFunctions.changeValueByColumnStr(newValue, column, columnValue);

    const url = route + '/' + elementKey;
    ManagerFunctions.patchElement(httpService, node, url, newValue, gridApi, extraReaction);
  }
}
