import swal from 'sweetalert2';
import { parseParms } from './url';

export class ManagerFunctions {
  /**
   * Parameters
   */

  public static metaUserAndData = [
    { headerName: 'User_id', field: 'user_id', width: 100, editable: false },
    {
      headerName: 'Created',
      field: 'created',
      width: 100,
      cellRenderer: ManagerFunctions.viewDate,
      editable: false,
    },
    {
      headerName: 'Updated',
      field: 'updated',
      width: 100,
      cellRenderer: ManagerFunctions.viewDate,
      editable: false,
    },
  ];

  public static buildingsUnitsLayouts = [
    {
      headerName: 'Buildings',
      field: 'buildings',
      filter: 'agNumberColumnFilter',
      width: 100,
      cellRenderer: ManagerFunctions.viewBuildings,
      editable: false,
    },
    {
      headerName: 'Units',
      field: 'units',
      filter: 'agNumberColumnFilter',
      width: 100,
      cellRenderer: ManagerFunctions.viewUnits,
      editable: false,
    },
    {
      headerName: 'Layouts',
      field: 'layouts',
      filter: 'agNumberColumnFilter',
      width: 100,
      editable: false,
    },
    {
      headerName: 'Progress',
      field: 'progress',
      cellRenderer: 'procentRenderer',
      filter: 'agNumberColumnFilter',
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'Progress Layouts',
      field: 'progressLayout',
      cellRenderer: 'procentRenderer',
      filter: 'agNumberColumnFilter',
      cellRendererParams: { editable: false },
    },
  ];

  public static progress = [
    {
      headerName: 'Delivered',
      field: 'delivered',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: true },
    },
    {
      headerName: 'Structured',
      field: 'structured',
      cellRenderer: 'checkboxRenderer',
      width: 110,
      cellRendererParams: { editable: true },
    },
    {
      headerName: 'Digitized',
      field: 'digitized',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: true },
    },
    {
      headerName: 'TLM-OBJ',
      field: 'TLM',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'LOD1-OBJ',
      field: 'LOD1',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'LOD2-OBJ',
      field: 'LOD2',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'ALTI-OBJ',
      field: 'ALTI',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'Georeferenced',
      field: 'georeferenced',
      cellRenderer: 'checkboxRenderer',
      width: 140,
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'Data Complete',
      field: 'data',
      cellRenderer: 'checkboxRenderer',
      width: 140,
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'DPOI',
      field: 'DPOI',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'View & Sun',
      field: 'view',
      cellRenderer: 'checkboxRenderer',
      width: 120,
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'Acoustics',
      field: 'acoustics',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'WBS',
      field: 'WBS',
      cellRenderer: 'checkboxRenderer',
      width: 100,
      cellRendererParams: { editable: false },
    },
    {
      headerName: 'BasicFeatures',
      field: 'basicFeatures',
      cellRenderer: 'checkboxRenderer',
      width: 140,
      cellRendererParams: { editable: false },
    },
  ];

  /**
   * RENDER FUNCTIONS
   */

  public static viewImg(params) {
    if (params.value && params.value !== '') {
      return `<a href='` + params.value + `' > View ` + params.value + `</a>`;
    }

    return ``;
  }

  public static viewDate(params) {
    if (params.value && params.value !== '') {
      const readable = new Date(params.value);
      const m = readable.getMonth(); // returns 6
      const d = readable.getDay(); // returns 15
      const y = readable.getFullYear(); // returns 2012
      return `${d}.${m}.${y}`;
    }
    return ``;
  }


  public static viewBuildings(params) {
    const number = params.value > 0 ? params.value : 0;
    return (
      number + ` <a href='/manager/building#address.city=` + params.data.city + `' > View </a>`
    );
  }

  public static viewUnits(params) {
    const number = params.value > 0 ? params.value : 0;
    return number + ` <a href='/manager/unit#address.city=` + params.data.city + `' > View </a>`;
  }


  public static cellPdfDownloadLink(params) {
    if (params && params.value && params.value !== '') {
      return (
        `<a href='/assets/pdf/example.pdf' download=` + params.value + `'>` + params.value + `</a>`
      );
    }
    return '';
  }

  /**
   * TOOLS
   */

  public static progressOutOfBuildings(buildingsList, unitsArray, layoutsArray){
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

    const progressBuildings =
      numBuildings > 0 ? numBuildingsReferenced * 100 / numBuildings : 0;

    const progressLayouts = numLayouts > 0 ? numLayoutsReferenced * 100 / numLayouts : 0;

    return {
      numberOfBuildings: numBuildings,
      numberOfUnits: numUnits,
      numberOfLayouts: numLayouts,
      progressOfBuildings: progressBuildings,
      progressOfLayouts: progressLayouts
    };

  }

  public static isReferencedBuilding(building) {
    return (
      building.building_reference.swiss_topo !== '' ||
      building.building_reference.open_street_maps !== ''
    );
  }

  public static isReferencedLayout(building) {
    return building.movement && building.movement.length > 0;
  }

  public static requestAllData(httpService, onComplete) {
    /**
    Observable.forkJoin([

    ]).subscribe(data => {});
   */
    httpService.get('http://api.archilyse.com/v1/layouts').subscribe(layouts => {
      const layoutsArray = <any[]>layouts;
      httpService.get('http://api.archilyse.com/v1/units').subscribe(units => {
        const unitsArray = <any[]>units;
        httpService.get('http://api.archilyse.com/v1/buildings').subscribe(buildings => {
          const buildingsArray = <any[]>buildings;
          httpService.get('http://api.archilyse.com/v1/sites').subscribe(sites => {
            const sitesArray = <any[]>sites;
            onComplete(sitesArray, buildingsArray, unitsArray, layoutsArray);
          }, console.error);
        }, console.error);
      }, console.error);
    }, console.error);
  }

  public static openNewWindow(url) {
    console.log('url', url);
    window.open(encodeURI(url), '_blank');
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
        const found = columnDefs.find(columnDef => columnDef.field === key);
        if (found) {
          model[key] = {
            filter: urlParams[key],
            filterType: 'text',
            type: 'equals',
          };
        }
      });
      gridApi.setFilterModel(model);
    });
  }

  /**
   * REACTIONS TO EVENTS
   */

  public static reactToDelete(httpService, selectedRows, gridApi, singular, plural, key, route) {
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
          httpService
            .delete('http://api.archilyse.com/v1/' + route + '/' + elementKey)
            .subscribe(elements => {
              console.log(`DELETE ${plural}`, elements, elementKey);
            }, console.error);
        });

        gridApi.updateRowData({
          remove: selectedRows,
        });
      }
    });
  }

  public static reactToEdit(httpService, params, key, route) {
    const element = params.data;
    const elementKey = element[key];

    const column = params.column.colId;
    const columnValue = params.value;

    const newValue = {};

    const columnParts = column.split('.');

    if (columnParts.length <= 1) {
      newValue[column] = columnValue;
    } else if (columnParts.length <= 2) {
      newValue[columnParts[0]] = {};
      newValue[columnParts[0]][columnParts[1]] = columnValue;
    } else if (columnParts.length <= 3) {
      newValue[columnParts[0]] = {};
      newValue[columnParts[0]][columnParts[1]] = {};
      newValue[columnParts[0]][columnParts[1]][columnParts[2]] = columnValue;
    }

    httpService
      .patch('http://api.archilyse.com/v1/' + route + '/' + elementKey, newValue)
      .subscribe(element => {
        console.log('EDIT building completed', element);
      }, console.error);
  }
}
