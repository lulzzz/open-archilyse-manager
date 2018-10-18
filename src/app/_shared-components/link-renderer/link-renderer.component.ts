import { Component } from '@angular/core';

/**
 * Renders angular links in the ag-grid (with the angular routing)
 * Normal links, primary and secondary keys with their icons
 * Also adds parameters to filter
 */
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

  readOnly;

  constructor() {}

  agInit(params): void {
    this.params = params;
    this.readOnly = false;

    if (params.readOnlyKey === true) {
      this.readOnly = true;
    }

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
    } else if (params.type === 'viewSiteOfBuilding') {
      this.url = `/manager/site`;
      this.fragment = `site_id=${params.data.site_id}`;
      this.type = 'secondaryKey';
    } else {
      console.error('unknown type', params.type);
    }
  }
}
