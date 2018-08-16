import { urlEditor, urlGeoreference, urlPortfolio } from './url';
import { ManagerFunctions } from './managerFunctions';
import { SimulationOverviewComponent } from './simulation-overview/simulation-overview.component';
import { AuthGuard } from '../_guards/auth.guard';

export class CellRender {
  /**
   * Distance, duration, score
   */

  public static distance(params) {
    if (params.value && params.value !== '') {
      return Math.floor(params.value) + ' m.';
    }
    return ``;
  }

  public static duration(params) {
    if (params.value && params.value !== '') {
      return Math.floor(params.value) + ' secs.';
    }
    return ``;
  }

  public static score(params) {
    if (params.value && params.value !== '') {
      return params.value.toFixed(6);
    }
    return ``;
  }

  public static latLan(params) {
    if (params.value && params.value !== '') {
      return params.value.toFixed(15);
    }
    return ``;
  }

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

  public static viewCountryInRegion(params) {
    const country = params.value ? params.value : 'Not defined';
    return (
      country + ` <a href='${urlPortfolio}/region#country=` + params.value + `' > View regions</a>`
    );
  }

  public static viewCountryInCountry(params) {
    const country = params.value ? params.value : 'Not defined';
    return country + ` <a href='${urlPortfolio}/country#country=` + params.value + `' > View </a>`;
  }

  public static viewSiteOfBuilding(params) {
    if (params.value && params.value !== '' && params.value !== 'None') {
      return (
        params.value +
        `<a href='${urlPortfolio}/site#site_id=` +
        params.data.site_id +
        `' > View </a>`
      );
    }
    return ``;
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
    if (params.value) {
      const layout_id = params.data.layout_id;
      for (let i = 0; i < params.value.length; i += 1) {
        const movements = params.value[i];
        const source = movements.source ? movements.source : 'open_street_maps';
        result += `<a href="${urlGeoreference}/building/${layout_id}?source=${source}">${source}</a>`;
      }
    }
    return result;
  }

  public static viewSimulationDpoiBuilding(params) {
    if (params.value && params.value === 'complete') {
      console.log('params.value', params.data.building_id);
      if (params.value === 'complete') {
        return (
          `<a href='${urlPortfolio}/simulation/building/` +
          params.data.building_id +
          `' > View raw</a> &nbsp; <a href='${urlPortfolio}/dpoi/` +
          params.data.building_id +
          `' > View dpoi</a> `
        );
      }
      return params.value;
    }
    return '?';
  }

  public static viewSimulationBuilding(params) {
    if (params.value && params.value === 'complete') {
      console.log('params.value', params.data.building_id);
      if (params.value === 'complete') {
        return (
          `<a href='${urlPortfolio}/simulation/building/` +
          params.data.building_id +
          `' > View raw</a>`
        );
      }
      return params.value;
    }
    return '?';
  }

  public static viewSimulationLayout(params) {
    if (params.value) {
      console.log('params.value', params.data.layout_id);
      if (params.value === 'complete') {
        return (
          `<a href='${urlPortfolio}/simulation/layout/` + params.data.layout_id + `' > View </a>`
        );
      }
      return params.value;
    }
    return '?';
  }

  public static viewModel(params) {
    if (params.value === 'Loading') {
      return `Loading ...`;
    }

    if (ManagerFunctions.isDigitalizedLayout(params.data)) {
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
