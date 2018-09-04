
export function renderTime(params) {
  if (params.value) {
    const newDate = new Date();
    newDate.setTime(params.value);
    return newDate.toUTCString();
  }
  return ``;
}

export function renderUrl(params) {
  if (params.value) {
    return `<a href="${params.value}" >${params.value}</a>`;
  }
  return ``;
}

export function renderRequest(params) {
  if (params.value && params.value.url) {
    return params.value.url;
  }
  return ``;
}

export function renderRequestMethod(params) {
  if (params.data && params.data.request && params.data.request.method) {
    return params.data.request.method;
  }
  return ``;
}

export function renderRequestBody(params) {
  if (params.data && params.data.request && params.data.request.body) {
    return JSON.stringify(params.data.request.body);
  }
  return ``;
}
