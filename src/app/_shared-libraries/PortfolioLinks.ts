import { environment } from '../../environments/environment';

/** Link to display layouts binded with the portfolio
 // HOW TO USE: ${getLayoutLink(this.layoutId)}
 When providing the layout object might use the Layout Name
 */
export function getLayoutLink(layoutId, layout?) {
  if (layoutId && layoutId !== '' && layoutId !== 'None') {
    let layoutName = layoutId;
    if (layout && layout.name && layout.name !== '') {
      layoutName = layout.name;
    }
    return `<a href="${
      environment.urlPortfolio
    }/layout#layout_id=${layoutId}">${layoutName}</a>`;
  }
  return `"undefined"`;
}

/** Link to display units binded with the portfolio
 // HOW TO USE: ${getUnitLink(this.unitId)}
 When providing the unit object might use the Unit Name
 */
export function getUnitLink(unitId, unit?) {
  if (unitId && unitId !== '' && unitId !== 'None') {
    let unitName = unitId;
    if (unit && unit.name && unit.name !== '') {
      unitName = unit.name;
    }
    return `<a href="${
      environment.urlPortfolio
    }/unit#unit_id=${unitId}">${unitName}</a>`;
  }
  return `"undefined"`;
}

/** Link to display buildings binded with the portfolio
 // HOW TO USE: ${getBuildingLink(this.buildingId)}
 When providing the building object might use the Building Name
 */
export function getBuildingLink(buildingId, building?) {
  if (buildingId && buildingId !== '' && buildingId !== 'None') {
    let buildingName = buildingId;
    if (building && building.name && building.name !== '') {
      buildingName = building.name;
    }
    return `<a href="${
      environment.urlPortfolio
    }/building#building_id=${buildingId}">${buildingName}</a>`;
  }
  return `"undefined"`;
}
