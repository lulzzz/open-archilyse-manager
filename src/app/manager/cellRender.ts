import { urlEditor, urlPortfolio } from './url';
import { ManagerFunctions } from './managerFunctions';

export class CellRender {
  /**
   * RENDER FUNCTIONS
   */

  public static viewFloors(params) {
    if (params.value && params.value !== '') {
      const floors = params.value.map(floor => {
        let text = 'View source';
        if (floor.source.indexOf('archilogic.com') >= 0) {
          text = 'View in Archilogic';
        }
        return (
          `${params.value.length > 1 ? ' ' + floor.floor_nr + ' ' : ''}<a href='` +
          floor.source +
          `' target="_blank"> ${text} </a>`
        );
      });
      return floors.join(', ');
    }

    return ``;
  }

  public static viewImg(params) {
    if (params.value && params.value !== '') {
      return `<a href='` + params.value + `' > View ` + params.value + `</a>`;
    }

    return ``;
  }


  public static viewSiteOfBuilding(params) {
    return (
      params.value +
      `<a href='${urlPortfolio}/site#site_id=` +
      params.data.site_id +
      `' > View </a>`
    );
  }

  public static viewUnitsOfBuilding(params) {
    const number = params.value > 0 ? params.value : 0;
    return (
      number +
      `<a href='${urlPortfolio}/unit#building_id=` +
      params.data.building_id +
      `' > View </a>`
    );
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

  public static viewBuildingsCountry(params) {
    const number = params.value > 0 ? params.value : 0;
    return (
      number +
      ` <a href='${urlPortfolio}/building#address.country=` +
      params.data.country +
      `' > View list</a>`
    );
  }

  public static viewBuildingsSite(params) {
    const number = params.value > 0 ? params.value : 0;
    return (
      number + `<a href='${urlPortfolio}/building#site_id=` + params.data.site_id + `' > View </a>`
    );
  }

  public static viewUnitsCountry(params) {
    const number = params.value > 0 ? params.value : 0;
    return (
      number +
      ` <a href='${urlPortfolio}/unit#address.country=` +
      params.data.country +
      `' > View </a>`
    );
  }

  public static viewBuildingsCity(params) {
    const number = params.value > 0 ? params.value : 0;
    return (
      number +
      ` <a href='${urlPortfolio}/building#address.city=` +
      params.data.city +
      `' > View </a>`
    );
  }

  public static viewUnitsCity(params) {
    const number = params.value > 0 ? params.value : 0;
    return (
      number + ` <a href='${urlPortfolio}/unit#address.city=` + params.data.city + `' > View </a>`
    );
  }

  public static cellPdfDownloadLink(params) {
    if (params && params.value && params.value !== '') {
      return (
        `<a href='${urlPortfolio}/assets/pdf/example.pdf' download=` +
        params.value +
        `'>` +
        params.value +
        `</a>`
      );
    }
    return '';
  }

  public static viewMovement(params) {
    let result = '';
    if (params.movements) {
      for (let i = 0; i < params.movements.length; i += 1) {
        const movements = params.movements[i];
        result += `<div>
            source: ${movements.source},
            angle: ${movements.angle}°,
            offset (xyz): ${movements.x_off}, ${movements.y_off}, ${movements.z_off}
            pivot (xyz): ${movements.x_pivot}, ${movements.y_pivot}, ${movements.z_pivot}
          </div>`;
      }
    }
    return result;
  }

  public static viewSimulation(params) {
    if (params.value) {
      return params.value;
    }
    return '?';
  }

  public static viewModel(params) {
    console.log('params.data', params.data);
    if (params.value === 'Loading') {
      return `Loading ...`;
    } else if (ManagerFunctions.isDigitalizedLayout(params.data)) {
      return `<a href='${urlEditor}/` + params.data.layout_id + `' > View model </a>`;
    }

    return `Not digitalized`;
  }

  public static areaInfoTotal(params) {
    if (params.value && params.value !== '' && params.value !== 'None' && params.value.length > 0) {
      return params.value.reduce((a, b) => a + b, 0).toFixed(2) + `m<sup>2</sup> `;
    }
    return ``;
  }

  public static areaInfo(params) {
    if (params.value && params.value !== '' && params.value !== 'None' && params.value.length > 0) {
      if (params.value.length > 1) {
        return (
          `(${params.value.length}) ` +
          params.value
            .sort()
            .reverse()
            .map(v => v.toFixed(2))
            .join(`m<sup>2</sup>, `) +
          `m<sup>2</sup> `
        );
      }

      return params.value[0].toFixed(2) + `m<sup>2</sup> `;
    }
    return ``;
  }

  public static viewUnit(params) {
    if (params.value && params.value !== '' && params.value !== 'None') {
      return (
        params.value + ` <a href='${urlPortfolio}/unit#unit_id=` + params.value + `' > View </a>`
      );
    }
    return ``;
  }

  public static viewBuilding(params) {
    if (params.value && params.value !== '' && params.value !== 'None') {
      return (
        params.value +
        ` <a href='${urlPortfolio}/building#building_id=` +
        params.value +
        `' > View </a>`
      );
    }
    return ``;
  }
}
