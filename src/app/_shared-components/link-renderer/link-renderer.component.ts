import { Component } from '@angular/core';

@Component({
  selector: 'app-link-renderer',
  templateUrl: './link-renderer.component.html',
  styleUrls: ['./link-renderer.component.scss'],
})
export class LinkRendererComponent {
  params;
  type;

  url;
  fragment;

  constructor() {}

  agInit(params): void {
    this.params = params;
    if (params.type === 'viewUnitsOfBuilding') {
      this.url = `/manager/unit`;
      this.fragment = `building_id=${params.data.building_id}`;
      this.type = 'number';
    } else if (params.type === 'viewLayouts') {
      this.url = `/manager/layout`;
      this.fragment = `unit_id=${params.data.unit_id}`;
      this.type = 'number';
    } else if (params.type === 'viewBuildingsCountry') {
      this.url = `/manager/building`;
      this.fragment = `address.country=${params.data.country}`;
      this.type = 'number';
    } else if (params.type === 'viewBuildingNumberSite') {
      this.url = `/manager/building`;
      this.fragment = `site_id=${params.data.site_id}`;
      this.type = 'number';
    } else if (params.type === 'viewBuildingsCity') {
      this.url = `/manager/building`;
      this.fragment = `address.city=${params.data.city}`;
      this.type = 'number';
    } else if (params.type === 'viewUnit') {
      this.url = `/manager/unit`;
      this.fragment = `unit_id=${params.data.unit_id}`;
      this.type = 'secondaryKey';
    } else if (params.type === 'viewBuilding') {
      this.url = `/manager/building`;
      this.fragment = `building_id=${params.data.building_id}`;
      this.type = 'secondaryKey';
    } else {
      console.error('unknown type', params.type);
    }
  }

  /**
   *   public static viewUnit(params) {
    if (params.value && params.value !== '' && params.value !== 'None') {
      return (
        `<i class="fas fa-key secondaryKey"></i> ` +
        params.value +
        ` <a href='/manager/unit#unit_id=` +
        params.value +
        `' > View </a>`
      );
    }
    return ``;
  }

   public static viewBuilding(params) {
    if (params.value && params.value !== '' && params.value !== 'None') {
      return (
        `<i class="fas fa-key"></i> ` +
        params.value +
        ` <a href='/manager/building#building_id=` +
        params.value +
        `' > View </a>`
      );
    }
    return ``;
  }

   public static cellId(params) {
    if (params.value && params.value !== '' && params.value !== 'None') {
      return `<i class="fas fa-key"></i> ` + params.value;
    }
    return ``;
  }
   */
}

/**

public static viewUnitsOfBuilding(params) {
  const number = params.value > 0 ? params.value : 0;
  return (
  number + `<a href='/manager/unit#building_id=` + params.data.building_id + `' > View </a>`
  );
}

 */
