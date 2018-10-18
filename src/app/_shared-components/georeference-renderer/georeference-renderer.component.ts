import { Component, OnInit } from '@angular/core';
import { ManagerFunctions } from '../../_shared-libraries/ManagerFunctions';

/**
 * ag-grid helper to display georeferenced data of buildings or layouts
 */
@Component({
  selector: 'app-georeference-renderer',
  templateUrl: './georeference-renderer.component.html',
  styleUrls: ['./georeference-renderer.component.scss'],
})
export class GeoreferenceRendererComponent {
  params;

  id;
  url;
  fragment;

  text;

  constructor() {}

  agInit(params): void {
    this.params = params;

    if (params.type === 'building_osm') {
      if (params.data.building_references) {
        const found = params.data.building_references.find(
          br => br.source === 'open_street_maps'
        );
        if (found && found.id) {
          this.url = `/georeference/map/${params.data.building_id}`;
          this.fragment = 'source=open_street_maps';
          this.id = found.id;
        }
      }
    } else if (params.type === 'building_st') {
      if (params.data.building_references) {
        const found = params.data.building_references.find(
          br => br.source === 'swiss_topo'
        );
        if (found && found.id) {
          this.url = `/georeference/map/${params.data.building_id}`;
          this.fragment = 'source=swiss_topo';
          this.id = found.id;
        }
      }
    } else if (params.type === 'layout') {
      if (params.value && params.value.length > 0) {
        for (let i = 0; i < params.value.length; i += 1) {
          const movements = params.value[i];
          const source = movements.source ? movements.source : 'swiss_topo'; // 'open_street_maps';

          this.url = `/georeference/building/${params.data.layout_id}`;
          this.fragment = `source=${source}`;
          this.id = source;

          // result += `<a href="/georeference/building/${layout_id}#source=${source}">${source}</a> `;
        }
      } else {
        if (!params.data.unit_id) {
          this.text = `No unit assigned`;
        } else if (!params.data.building_id) {
          this.text = `No building assigned`;
        } else if (!ManagerFunctions.isDigitalizedLayout(params.data)) {
          this.text = `Not digitalized`;
        } else {
          if (params.data.building_referenced_osm) {
            this.url = `/georeference/building/${params.data.layout_id}`;
            this.fragment = `source=open_street_maps`;
            this.id = 'Georeference';
          } else {
            this.url = `/georeference/building/${params.data.layout_id}`;
            this.id = 'Georeference';
          }
        }
      }
    } else {
      console.error('unknown type', params.type);
    }
  }
}
