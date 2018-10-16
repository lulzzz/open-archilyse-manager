import { ManagerFunctions } from './ManagerFunctions';

/**
 * ag-grid Class with methods to render different values.
 */
export class CellRender {
  /**
   * Displays a site as human readable as possible (with Id's for developers):
   * If name is found the displayed, otherwise the id
   * @param currentProfile - Selected profile from the user
   * @param params - Cell parameters from Ag - grid
   */
  public static siteFormatter(currentProfile, params) {
    if (params && params.value) {
      const site = this['sitesArray'].find(site => site.site_id === params.value);
      const isDev = currentProfile === 'developer';
      if (site && site.name && site.name !== '') {
        if (isDev) {
          return site.name + ' - ' + params.value;
        }
        return site.name + ' - ' + site.description;
      }
    }
    return params.value;
  }

  /**
   * Displays a building as human readable as possible (with Id's for developers):
   * If building is found the displayed, otherwise the id
   * @param currentProfile - Selected profile from the user
   * @param params - Cell parameters from Ag - grid
   */
  public static buildingFormatter(currentProfile, params) {
    if (params && params.value) {
      const building = this['buildingsArray'].find(
        building => building.building_id === params.value
      );

      const isDev = currentProfile === 'developer';
      if (building && building.name && building.name !== '') {
        if (isDev) {
          return building.name + ' - ' + params.value;
        }

        if (ManagerFunctions.isAddressCorrect(building)) {
          return (
            building.name + ' - ' + building.address.street + ', ' + building.address.street_nr
          );
        }

        return building.name + ' - ' + building.description;
      }
    }
    return params.value;
  }

  /**
   * Displays a unit as human readable as possible (with Id's for developers):
   * If building is found the displayed, otherwise the id
   * @param currentProfile - Selected profile from the user
   * @param params - Cell parameters from Ag - grid
   */
  public static unitFormatter(currentProfile, params) {
    if (params && params.value) {
      const unit = this['unitsArray'].find(unit => unit.unit_id === params.value);

      const isDev = currentProfile === 'developer';
      if (unit && unit.name && unit.name !== '') {
        if (isDev) {
          return unit.name + ' - ' + params.value;
        }
        if (unit.address.floor_nr && unit.address.additional) {
          return unit.name + ' - Nr' + unit.address.floor_nr + ', ' + unit.address.additional;
        }
        if (unit.address.floor_nr) {
          return unit.name + ' - Nr' + unit.address.floor_nr;
        }
        if (unit.address.additional) {
          return unit.name + ' - ' + unit.address.additional;
        }
        return unit.name + ' - ' + unit.description;
      }
    }
    return params.value;
  }

  /**
   * Distance, duration, score
   */
  public static dpoiCategory(params) {
    if (params.value) {
      return params.value;
    }
    return ``;
  }

  /**
   * Human names for DPOI
   * @param params
   */
  public static dpoiName(params) {
    if (params.value && params.value !== '') {
      const translate = {
        agrarian: 'Agrarian',
        alcohol: 'Alcohol',
        amusement_arcade: 'Amusement arcade',
        antiques: 'Antiques',
        apartments: 'Apartments',
        art: 'Art',
        arts_centre: 'Arts centre',
        atm: 'ATM',
        baby_goods: 'Baby goods',
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
        bag: 'Bag',
        bandstand: 'Bandstand',
        bare_rock: 'Bare rock',
        beach: 'Beach',
        beach_resort: 'Beach resort',
        bird_hide: 'Bird hide',
        boat: 'Boat',
        boat_rental: 'Boat rental',
        boat_sharing: 'Boat sharing',
        brothel: 'Brothel',
        bureau_de_change: 'Bureau de change',
        candles: 'Candles',
        car_rental: 'Car rental',
        cathedral: 'Cathedral',
        charity: 'Charity',
        cheese: 'Cheese',
        childcare: 'Childcare',
        cliff: 'Cliff',
        collector: 'Collector',
        common: 'Common',
        coordinates: 'Coordinates',
        curtain: 'Curtain',
        dog_park: 'Dog park',
        dormitory: 'Dormitory',
        escape_game: 'Escape game',
        ferry_terminal: 'Ferry terminal',
        fishing: 'Fishing',
        food_court: 'Food court',
        frame: 'Frame',
        games: 'Games',
        garden_furniture: 'Garden furniture',
        general: 'General',
        glaziery: 'Glaziery',
        herbalist: 'Herbalist',
        houseware: 'Houseware',
        ice_cream: 'Ice cream',
        lamps: 'Lamps',
        language_school: 'Language school',
        leather: 'Leather',
        locksmith: 'Locksmith',
        marina: 'Marina',
        massage: 'Massage',
        model: 'Model',
        newsagent: 'Newsagent',
        nutrition_supplements: 'Nutrition supplements',
        pasta: 'Pasta',
        pastry: 'Pastry',
        public_bookcase: 'Public bookcase',
        radiotechnics: 'Radiotechnics',
        rock: 'Rock',
        seafood: 'Seafood',
        shingle: 'Shingle',
        slipway: 'Slipway',
        social_centre: 'Social centre',
        spices: 'Spices',
        spring: 'Spring',
        stone: 'Stone',
        stripclub: 'Stripclub',
        studio: 'Studio',
        subway_entrance: 'Subway entrance',
        swimming_area: 'Swimming area',
        swingerclub: 'Swingerclub',
        tram: 'Tram',
        variety_store: 'Variety store',
        video: 'Video',
        video_games: 'Video games',
      };

      if (!translate[params.value]) {
        console.error('Missing name', params.value);
      }

      if (params.data.category && params.data.category !== '') {
        return translate[params.value]
          ? `<a href="https://wiki.openstreetmap.org/wiki/Tag:${params.data.category_original}=${
              params.value
            }" target="_blank"><i class="fas fa-info-circle"></i></a>  <a href="https://taginfo.openstreetmap.org/tags/${
              params.data.category_original
            }=${params.value}" target="_blank"><i class="fas fa-tag"></i></a> &nbsp; ${
              translate[params.value]
            } `
          : params.value;
      }

      return translate[params.value]
        ? `<a href="https://wiki.openstreetmap.org/wiki/Key:${
            params.value
          }" target="_blank"><i class="fas fa-info-circle"></i></a> <a href="https://taginfo.openstreetmap.org/keys/${
            params.value
          }" target="_blank"><i class="fas fa-tag"></i></a> ${translate[params.value]} `
        : params.value;
    }
    return ``;
  }

  /**
   * Based on the value displayed in 3 colors: Negative, Positive, Neutral (defined with css)
   * It has a 0.5 margin and after displays the unit
   * @param value
   * @param unit
   */
  public static compareValue(value, unit) {
    const margin = 0.5;
    let classSpan = 'diffNeutral';
    if (value > margin) {
      classSpan = 'diffNegative';
    } else if (value < -margin) {
      classSpan = 'diffPositive';
    }
    return `<span class="${classSpan}">${value}${unit}</span>`;
  }

  /**
   * Based on the value displayed in 3 colors: Negative, Positive, Neutral (defined with css)
   * It has a 0.1 margin
   * @param value
   */
  public static compareValueScore(value) {
    const margin = 0.1;
    let classSpan = 'diffNeutral';
    if (value > margin) {
      classSpan = 'diffNegative';
    } else if (value < -margin) {
      classSpan = 'diffPositive';
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

  public static viewHeight(params) {
    if (params.value && params.value !== '') {
      return Math.floor(params.value) + ' m.';
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

  public static viewLatLan(params) {
    if (
      params.data &&
      params.data.latitude &&
      params.data.latitude !== '' &&
      params.data.longitude &&
      params.data.longitude !== ''
    ) {
      const coordinates = params.api.getRowNode('coordinates');

      return `<a href="https://www.google.com/maps/place/${params.data.latitude}N+${
        params.data.longitude
      }E/" target="_blank">View</a> &nbsp; &nbsp; <a href="https://www.google.com/maps/dir/${
        coordinates.data.latitude
      }N+${coordinates.data.longitude}E/${params.data.latitude}N+${
        params.data.longitude
      }E/" target="_blank">View path</a>`;
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
          text = `View floor ${floor.floor_nr} in Archilogic`;
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
    return country + ` <a href='/manager/region#country=` + params.value + `' > View regions</a>`;
  }

  public static viewCountryInCountry(params) {
    const country = params.value ? params.value : 'Not defined';
    return country + ` <a href='/manager/country#country=` + params.value + `' > View </a>`;
  }

  public static viewSiteOfBuilding(params) {
    if (params.value && params.value !== '' && params.value !== 'None') {
      return (
        `<i class="fas fa-key secondaryKey"></i> ` +
        params.value +
        `<a href='/manager/site#site_id=` +
        params.data.site_id +
        `' > View </a>`
      );
    }
    return ``;
  }

  /**
   * Render a date in a human readable
   * @param params
   */
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

  public static cellPdfDownloadLink(params) {
    // if (params && params.value && params.value !== '') {
    return (
      `<a href='/manager/assets/pdf/example.pdf' download=` +
      params.value +
      `'>` +
      params.value +
      `</a>`
    );
    /*
    }
    return '';
    */
  }

  public static viewModel(params) {
    if (params.value === 'Loading') {
      return `Loading ...`;
    }

    if (ManagerFunctions.isDigitalizedLayout(params.data)) {
      return `<a href='/editor/` + params.data.layout_id + `' > View / edit model </a>`;
    }

    return `Not digitised`;
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

  public static cellId(params) {
    if (params.value && params.value !== '' && params.value !== 'None') {
      return `<i class="fas fa-key"></i> ` + params.value;
    }
    return ``;
  }
}
