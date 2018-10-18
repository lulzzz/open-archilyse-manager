/**
 * Display the time in a human way
 * @param params
 */
export function renderTime(params) {
  if (params.value) {
    const newDate = new Date();
    newDate.setTime(params.value);
    return newDate.toUTCString();
  }
  return ``;
}

/**
 * Renders a URL with a link target _blank
 * @param params
 */
export function renderUrl(params) {
  if (params.value) {
    return `<a href="${params.value}" target="_blank" >${params.value}</a>`;
  }
  return ``;
}

/**
 * The URL from the request
 * @param params
 */
export function renderRequest(params) {
  if (params.value && params.value.url) {
    return params.value.url;
  }
  return ``;
}

/**
 * PUT / PATCH / GET / POST ...
 * @param params
 */
export function renderRequestMethod(params) {
  if (params.data && params.data.request && params.data.request.method) {
    return params.data.request.method;
  }
  return ``;
}

/**
 * Parameters in a JSON format
 * @param params
 */
export function renderRequestBody(params) {
  if (params.data && params.data.request && params.data.request.body) {
    return JSON.stringify(params.data.request.body);
  }
  return ``;
}
