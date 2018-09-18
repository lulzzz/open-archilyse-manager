import { environment } from '../../../environments/environment';

const apiUrl = environment.apiUrl;

/**
 * Returns out of the log data the URLS from the documentation.
 * @param params
 */
export function renderRequestLinkDocs(params) {
  if (params.data && params.data.request && params.data.request.url && params.data.request.method) {
    const url = params.data.request.url;
    const method = params.data.request.method;
    const baseUrl = 'https://www.archilyse.com/api/docs/';

    if (method === 'GET') {
      /**
       * Plural routes
       */
      if (url === apiUrl + 'sites') {
        return `<a href="${baseUrl}#/reference/sites/site-collection/get-all-sites" >View</a>`;
      }
      if (url === apiUrl + 'buildings') {
        return `<a href="${baseUrl}#/reference/buildings/building-collection/get-all-buildings" >View</a>`;
      }
      if (url === apiUrl + 'units') {
        return `<a href="${baseUrl}#/reference/units/unit-collection/get-all-units" >View</a>`;
      }
      if (url === apiUrl + 'layouts') {
        return `<a href="${baseUrl}#/reference/layouts/layout-collection/get-all-layouts" >View</a>`;
      }

      /**
       * Singular routes
       */
      if (url.startsWith(apiUrl + 'sites')) {
        return `<a href="${baseUrl}#/reference/sites/site-collection/get-site" >View</a>`;
      }
      if (url.startsWith(apiUrl + 'buildings')) {
        return `<a href="${baseUrl}#/reference/buildings/building-collection/get-building" >View</a>`;
      }
      if (url.startsWith(apiUrl + 'units')) {
        return `<a href="${baseUrl}#/reference/units/unit-collection/get-unit" >View</a>`;
      }
      if (url.startsWith(apiUrl + 'layouts')) {
        return `<a href="${baseUrl}#/reference/layouts/layout-collection/get-layout" >View</a>`;
      }

      return 'Description not yet available';
    }
    if (method === 'POST') {
      if (url === apiUrl + 'sites') {
        return `<a href="${baseUrl}#/reference/sites/site-collection/create-a-site" >View</a>`;
      }
      if (url === apiUrl + 'buildings') {
        return `<a href="${baseUrl}#/reference/buildings/building-collection/create-a-building" >View</a>`;
      }
      if (url === apiUrl + 'units') {
        return `<a href="${baseUrl}#/reference/units/unit-collection/create-a-unit" >View</a>`;
      }
      if (url === apiUrl + 'layouts') {
        return `<a href="${baseUrl}#/reference/layouts/layout-collection/create-a-layout" >View</a>`;
      }

      return 'Description not yet available';
    }
    if (method === 'DELETE') {
      if (url.startsWith(apiUrl + 'sites/')) {
        return `<a href="${baseUrl}#/reference/sites/site/delete-site" >View</a>`;
      }
      if (url.startsWith(apiUrl + 'buildings')) {
        return `<a href="${baseUrl}#/reference/buildings/building/delete-building" >View</a>`;
      }
      if (url.startsWith(apiUrl + 'units')) {
        return `<a href="${baseUrl}#/reference/units/unit/delete-unit" >View</a>`;
      }
      if (url.startsWith(apiUrl + 'layouts')) {
        return `<a href="${baseUrl}#/reference/layouts/layout/delete-layout" >View</a>`;
      }

      return 'Description not yet available';
    }
    if (method === 'PATCH') {
      if (url.startsWith(apiUrl + 'sites')) {
        return `<a href="${baseUrl}#/reference/sites/site-collection/get-all-sites" >View</a>`;
      }
      if (url.startsWith(apiUrl + 'buildings')) {
        return `<a href="${baseUrl}#/reference/buildings/building-collection/get-all-buildings" >View</a>`;
      }
      if (url.startsWith(apiUrl + 'units')) {
        return `<a href="${baseUrl}#/reference/units/unit-collection/get-all-units" >View</a>`;
      }
      if (url.startsWith(apiUrl + 'layouts')) {
        return `<a href="${baseUrl}#/reference/layouts/layout-collection/get-all-layouts" >View</a>`;
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
      /**
       * Plural routes
       */

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

      /**
       * Singular routes
       */
      if (url.startsWith(apiUrl + 'sites')) {
        return 'Requests the specified site by the site_id ';
      }
      if (url.startsWith(apiUrl + 'buildings')) {
        return 'Requests the specified building by the building_id ';
      }
      if (url.startsWith(apiUrl + 'units')) {
        return 'Requests the specified unit by the unit_id ';
      }
      if (url.startsWith(apiUrl + 'layouts')) {
        return 'Requests the specified layout by the layout_id ';
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
