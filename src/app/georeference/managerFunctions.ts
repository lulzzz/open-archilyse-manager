import { parseParms } from './url';

export class ManagerFunctions {
  public static setDefaultFilters(route, columnDefs, gridApi) {
    return route.fragment.subscribe(fragment => {
      const urlParams = parseParms(fragment);

      const model = {};
      Object.keys(urlParams).forEach(key => {
        columnDefs.forEach(group => {
          const found = group.children.find(columnDef => columnDef.field === key);
          if (found) {
            model[key] = {
              filter: urlParams[key],
              filterType: 'text',
              type: 'equals',
            };
          }
        });
      });
      gridApi.setFilterModel(model);
    });
  }
}
