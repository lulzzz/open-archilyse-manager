export const HEXAGON = 'HEXAGON';
export const WINDOW = 'WINDOW';
export const SEAT = 'SEAT';
export const DESK = 'DESK';
export const AREA = 'AREA';
export const WALL = 'WALL';
export const DOOR = 'DOOR';
export const AREA_DIFF = 'AREA_DIFF';

export const TOILET = 'TOILET';
export const KITCHEN = 'KITCHEN';
export const OFFICE_MISC = 'OFFICE_MISC';
export const MISC = 'MISC';

export const STAIRS = 'STAIRS';
export const SINK = 'SINK';

export function toCapital(txt, firstCapital) {
  if (firstCapital) {
    return txt.substr(0, 1).toUpperCase() + txt.substr(1, txt.length - 1);
  }
  return txt;
}
export function groupToHuman(group, plural, firstCapital) {
  let pluralStr = '';
  let singleStr = '';

  if (group === WINDOW) {
    pluralStr = 'windows';
    singleStr = 'window';
  } else if (group === DESK) {
    pluralStr = 'desks';
    singleStr = 'desk';
  } else if (group === SEAT) {
    pluralStr = 'seats';
    singleStr = 'seat';
  } else if (group === WALL) {
    pluralStr = 'walls';
    singleStr = 'wall';
  } else if (group === AREA_DIFF) {
    pluralStr = 'areas of high value';
    singleStr = 'area of high value';
  } else if (group === AREA) {
    pluralStr = 'areas';
    singleStr = 'area';
  } else if (group === DOOR) {
    pluralStr = 'doors';
    singleStr = 'door';
  } else if (group === TOILET) {
    pluralStr = 'toilets';
    singleStr = 'toilet';
  } else if (group === STAIRS) {
    pluralStr = 'STAIRS';
    singleStr = 'STAIRS';
  } else if (group === SINK) {
    pluralStr = 'sinks';
    singleStr = 'sink';
  } else if (group === KITCHEN) {
    pluralStr = 'kitchens';
    singleStr = 'kitchen';
  } else if (group === OFFICE_MISC) {
    pluralStr = 'office miscs';
    singleStr = 'office misc';
  }

  if (plural) {
    return toCapital(pluralStr, firstCapital);
  }

  return toCapital(singleStr, firstCapital);
}
