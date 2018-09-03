import { environment } from '../../../environments/environment';

const apiUrl = environment.apiUrl;

export function renderRequestLinkDocs(params) {
  if (params.data && params.data.request && params.data.request.url && params.data.request.method) {
    const url = params.data.request.url;
    const method = params.data.request.method;
    const baseUrl = 'https://api.archilyse.com/v0.1/ui/';

    if (method === 'GET') {
      if (url === apiUrl + 'sites') {
        return `<a href="${baseUrl}#!/Sites/get_sites" >View</a>`;
      }
      if (url === apiUrl + 'buildings') {
        return `<a href="${baseUrl}#!/Buildings/get_buildings" >View</a>`;
      }
      if (url === apiUrl + 'units') {
        return `<a href="${baseUrl}##!/Units/get_units" >View</a>`;
      }
      if (url === apiUrl + 'layouts') {
        return `<a href="${baseUrl}#!/Layouts/get_layouts" >View</a>`;
      }

      return 'Description not yet available';
    }
    if (method === 'POST') {
      if (url === apiUrl + 'sites') {
        return `<a href="${baseUrl}#!/Sites/post_sites" >View</a>`;
      }
      if (url === apiUrl + 'buildings') {
        return `<a href="${baseUrl}#!/Buildings/post_buildings" >View</a>`;
      }
      if (url === apiUrl + 'units') {
        return `<a href="${baseUrl}##!/Units/post_units" >View</a>`;
      }
      if (url === apiUrl + 'layouts') {
        return `<a href="${baseUrl}#!/Layouts/post_layouts" >View</a>`;
      }

      return 'Description not yet available';
    }
    if (method === 'DELETE') {
      if (url.startsWith(apiUrl + 'sites/')) {
        return `<a href="${baseUrl}#!/Sites/delete_site_by_id" >View</a>`;
      }
      if (url.startsWith(apiUrl + 'buildings')) {
        return `<a href="${baseUrl}#!/Buildings/delete_building_by_id" >View</a>`;
      }
      if (url.startsWith(apiUrl + 'units')) {
        return `<a href="${baseUrl}##!/Units/delete_unit_by_id" >View</a>`;
      }
      if (url.startsWith(apiUrl + 'layouts')) {
        return `<a href="${baseUrl}#!/Layouts/delete_layout_by_id" >View</a>`;
      }

      return 'Description not yet available';
    }
    if (method === 'PATCH') {
      if (url.startsWith(apiUrl + 'sites/')) {
        return `<a href="${baseUrl}#!/Sites/patch_site_by_id" >View</a>`;
      }
      if (url.startsWith(apiUrl + 'buildings')) {
        return `<a href="${baseUrl}#!/Buildings/patch_building_by_id" >View</a>`;
      }
      if (url.startsWith(apiUrl + 'units')) {
        return `<a href="${baseUrl}##!/Units/patch_unit_by_id" >View</a>`;
      }
      if (url.startsWith(apiUrl + 'layouts')) {
        return `<a href="${baseUrl}#!/Layouts/patch_layout_by_id" >View</a>`;
      }

      return 'Description not yet available';
    }
  }
  return ``;
}

export function renderRequestDescription(params) {
  if (params.data && params.data.request && params.data.request.url && params.data.request.method) {
    const url = params.data.request.url;
    const method = params.data.request.method;

    if (method === 'GET') {
      if (url === apiUrl + 'sites') {
        return 'Requests all the sites';
      }
      if (url === apiUrl + 'buildings') {
        return 'Requests all the buildings';
      }
      if (url === apiUrl + 'units') {
        return 'Requests all the units';
      }
      if (url === apiUrl + 'layouts') {
        return 'Requests all the layouts';
      }

      return 'Description not yet available';
    }
    if (method === 'POST') {
      if (url === apiUrl + 'sites') {
        return 'Creates a new site, with the values specified in the request body';
      }
      if (url === apiUrl + 'buildings') {
        return 'Creates a new building, with the values specified in the request body';
      }
      if (url === apiUrl + 'units') {
        return 'Creates a new unit, with the values specified in the request body';
      }
      if (url === apiUrl + 'layouts') {
        return 'Creates a new layout, with the values specified in the request body';
      }

      return 'Description not yet available';
    }
    if (method === 'DELETE') {
      if (url.startsWith(apiUrl + 'sites/')) {
        return 'Deletes the specified site by the site_id';
      }
      if (url.startsWith(apiUrl + 'buildings')) {
        return 'Deletes the specified building by the building_id';
      }
      if (url.startsWith(apiUrl + 'units')) {
        return 'Deletes the specified unit by the unit_id';
      }
      if (url.startsWith(apiUrl + 'layouts')) {
        return 'Deletes the specified layout by the layout_id';
      }

      return 'Description not yet available';
    }
    if (method === 'PATCH') {
      if (url.startsWith(apiUrl + 'sites/')) {
        return 'Updates the specified site by the site_id, with the new values specified in the request body';
      }
      if (url.startsWith(apiUrl + 'buildings')) {
        return 'Updates the specified building by the building_id, with the new values specified in the request body';
      }
      if (url.startsWith(apiUrl + 'units')) {
        return 'Updates the specified unit by the unit_id, with the new values specified in the request body';
      }
      if (url.startsWith(apiUrl + 'layouts')) {
        return 'Updates the specified layout by the layout_id, with the new values specified in the request body';
      }

      return 'Description not yet available';
    }
  }
  return ``;
}
