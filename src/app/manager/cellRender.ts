import { urlEditor, urlGeoreference, urlPortfolio, urlSimulationViewer } from './url';
import { ManagerFunctions } from './managerFunctions';
import { SimulationOverviewComponent } from './simulation-overview/simulation-overview.component';
import { AuthGuard } from '../_guards/auth.guard';

export class CellRender {
  /**
   * Distance, duration, score
   */

  public static dpoiCategory(params) {
    if (params.value) {
      return params.value;
    }
    return ``;
  }

  public static dpoiName(params) {
    if (params.value && params.value !== '') {
      const translate = {
        alcohol: 'Alcohol',
        antiques: 'Antiques',
        apartments: 'Apartments',
        art: 'Art',
        arts_centre: 'Arts centre',
        atm: 'ATM',
        bakery: 'Bakery',
        bank: 'Bank',
        bar: 'Bar',
        bathroom_furnishing: 'Bathroom furnishing',
        bbq: 'BBQ',
        beauty: 'Beauty',
        bed: 'Bed',
        beverages: 'Beverages',
        bicycle: 'Bicycle',
        bicycle_parking: 'Bicycle_parking',
        bicycle_rental: 'Bicycle_rental',
        bicycle_repair_station: 'Bicycle_repair_station',
        books: 'Books',
        boutique: 'Boutique',
        bus_station: 'Bus_station',
        bus_stop: 'Bus_stop',
        butcher: 'Butcher',
        cafe: 'Cafe',
        car: 'Car',
        car_parts: 'Car parts',
        car_repair: 'Car repair',
        car_sharing: 'Car Sharing',
        car_wash: 'Car wash',
        carpet: 'Carpet',
        cave_entrance: 'Cave entrance',
        chapel: 'Chapel',
        charging_station: 'Charging station',
        chemist: 'Chemist',
        chocolate: 'Chocolate',
        church: 'Church',
        cinema: 'Cinema',
        civic: 'Civic',
        clinic: 'Clinic',
        clothes: 'Clothes',
        coffee: 'Coffee',
        college: 'College',
        commercial: 'Commercial',
        community_centre: 'Community centre',
        computer: 'Computer',
        confectionery: 'Confectionery',
        convenience: 'Convenience',
        cosmetics: 'Cosmetics',
        craft: 'Craft',
        dairy: 'Dairy',
        dance: 'Dance',
        deli: 'Deli',
        dentist: 'Dentist',
        department_store: 'Department store',
        detached: 'Detached',
        doctors: 'Doctors',
        doityourself: 'Doityourself',
        drinking_water: 'Drinking water',
        driving_school: 'Driving school',
        electronics: 'Electronics',
        erotic: 'Erotic',
        fabric: 'Fabric',
        farm: 'Farm',
        fashion: 'Fashion',
        fast_food: 'Fast food',
        firepit: 'Firepit',
        fitness_centre: 'Fitness centre',
        florist: 'Florist',
        fountain: 'Fountain',
        fuel: 'Fuel',
        furniture: 'Furniture',
        garden: 'Garden',
        garden_centre: 'Garden centre',
        gift: 'Gift',
        golf_course: 'Golf course',
        grassland: 'Grassland',
        greengrocer: 'Greengrocer',
        grit_bin: 'Grit bin',
        hackerspace: 'Hackerspace',
        hairdresser: 'Hairdresser',
        halt: 'Halt',
        hardware: 'Hardware',
        hearing_aids: 'Hearing aids',
        hifi: 'Hifi',
        horse_riding: 'Horse riding',
        hospital: 'Hospital',
        hotel: 'Hotel',
        house: 'House',
        ice_rink: 'Ice rink',
        industrial: 'Industrial',
        interior_decoration: 'Interior decoration',
        jewelry: 'Jewelry',
        kindergarten: 'Kindergarten',
        kiosk: 'Kiosk',
        kitchen: 'Kitchen',
        library: 'Library',
        mall: 'Mall',
        medical_supply: 'Medical supply',
        miniature_golf: 'Miniature golf',
        mobile_phone: 'Mobile phone',
        motorcycle: 'Motorcycle',
        motorcycle_parking: 'Motorcycle parking',
        music: 'Music',
        music_school: 'Music school',
        musical_instrument: 'Musical instrument',
        nature_reserve: 'Nature reserve',
        nightclub: 'Nightclub',
        nursing_home: 'Nursing home',
        office: 'Office',
        outdoor: 'Outdoor',
        paint: 'Paint',
        park: 'Park',
        parking: 'Parking',
        parking_entrance: 'Parking entrance',
        parking_space: 'Parking space',
        peak: 'Peak',
        perfumery: 'Perfumery',
        pharmacy: 'Pharmacy',
        photo: 'Photo',
        picnic_table: 'Picnic table',
        pitch: 'Pitch',
        platform: 'Platform',
        playground: 'Playground',
        pub: 'Pub',
        residential: 'Residential',
        restaurant: 'Restaurant',
        retail: 'Retail',
        saddle: 'Saddle',
        sand: 'Sand',
        sauna: 'Sauna',
        school: 'School',
        scree: 'Scree',
        scrub: 'Scrub',
        scuba_diving: 'Scuba diving',
        second_hand: 'Second hand',
        sewing: 'Sewing',
        shoes: 'Shoes',
        social_facility: 'Social facility',
        sports: 'Sports',
        sports_centre: 'Sports centre',
        stadium: 'Stadium',
        station: 'Station',
        stationery: 'Stationery',
        stop_position: 'Stop position',
        supermarket: 'Supermarket',
        swimming_pool: 'Swimming pool',
        tailor: 'Tailor',
        taxi: 'Taxi',
        tea: 'Tea',
        terrace: 'Terrace',
        track: 'Track',
        train_station: 'Train station',
        transportation: 'Transportation',
        tree: 'Tree',
        university: 'University',
        veterinary: 'Veterinary',
        warehouse: 'Warehouse',
        water: 'Water',
        water_park: 'Water park',
        wetland: 'Wetland',
        wine: 'Wine',
        wood: 'Wood',
      };

      return translate[params.value] ? translate[params.value] : params.value;
    }
    return ``;
  }

  public static compareValue(value, unit) {
    let classSpan = 'diffNeutral';
    if (value > 0.5) {
      classSpan = 'diffPositive';
    } else if (value < -0.5) {
      classSpan = 'diffNegative';
    }
    return `<span class="${classSpan}">${value}${unit}</span>`;
  }
  public static compareValueScore(value) {
    let classSpan = 'diffNeutral';
    if (value > 0.5) {
      classSpan = 'diffPositive';
    } else if (value < -0.5) {
      classSpan = 'diffNegative';
    }
    return `<span class="${classSpan}">${value.toFixed(6)}</span>`;
  }

  public static distanceCompare(params) {
    if (params.value && params.value !== '') {
      const value = Math.floor(params.value);
      return CellRender.compareValue(value, ' m.');
    }
    return ``;
  }

  public static durationCompare(params) {
    if (params.value && params.value !== '') {
      const value = Math.floor(params.value);
      return CellRender.compareValue(value, ' secs.');
    }
    return ``;
  }

  public static scoreCompare(params) {
    if (params.value && params.value !== '') {
      const value = params.value;
      return CellRender.compareValueScore(value);
    }
    return ``;
  }

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
          `<a href='${urlSimulationViewer}/simulation/layout/` +
          params.data.layout_id +
          `' > View </a>`
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
