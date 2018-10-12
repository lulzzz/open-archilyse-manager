export class EditorConstants {
  /**
   * MOVEMENT TYXPES
   */
  static SIZE = 10;
  static MOVE = 20;
  static ROTATE = 30;

  static AREA = 'AREA';
  static AREA_DIFF = 'AREA_DIFF';
  static WALL = 'WALL';

  /** Features */
  static TOILET = 'FeatureType.TOILET';
  static STAIRS = 'FeatureType.STAIRS';
  static SINK = 'FeatureType.SINK';
  static KITCHEN = 'FeatureType.KITCHEN';
  static DESK = 'FeatureType.DESK';
  static CHAIR = 'FeatureType.CHAIR';
  static OFFICE_MISC = 'FeatureType.OFFICE_MISC';
  static MISC = 'FeatureType.MISC';

  /** Separators */
  static ENVELOPE = 'SeparatorType.ENVELOPE';
  static RAILING = 'SeparatorType.RAILING';
  static SEPARATOR_NOT_DEFINED = 'SeparatorType.NOT_DEFINED';

  /** AreaType */
  static BATHROOM = 'AreaType.BATHROOM';
  static AREA_KITCHEN = 'AreaType.KITCHEN';
  static AREA_KITCHEN_DINING = 'AreaType.KITCHEN_DINING';
  static AREA_NOT_DEFINED = 'AreaType.NOT_DEFINED';
  static SHAFT = 'AreaType.SHAFT';
  static BALCONY = 'AreaType.BALCONY';
  static CORRIDOR = 'AreaType.CORRIDOR';
  static STOREROOM = 'AreaType.STOREROOM';
  static ROOM = 'AreaType.ROOM';
  static DINING = 'AreaType.DINING';

  /** SpaceType */
  static SPACE_NOT_DEFINED = 'SpaceType.NOT_DEFINED';

  /** OpeningType */
  static DOOR = 'OpeningType.DOOR';
  static WINDOW_ENVELOPE = 'OpeningType.WINDOW_ENVELOPE';
  static WINDOW_INTERIOR = 'OpeningType.WINDOW_INTERIOR';

  static to_be_filled = 'to be filled';
}

export function toCapital(txt, firstCapital) {
  if (firstCapital) {
    return txt.substr(0, 1).toUpperCase() + txt.substr(1, txt.length - 1);
  }
  return txt;
}
export function groupToHuman(group, plural, firstCapital) {
  let pluralStr = '';
  let singleStr = '';

  if (group === EditorConstants.MISC) {
    pluralStr = 'miscellaneous';
    singleStr = 'miscellaneous';
  } else if (group === EditorConstants.AREA) {
    pluralStr = 'areas';
    singleStr = 'area';
  } else if (group === EditorConstants.DESK) {
    pluralStr = 'desks';
    singleStr = 'desk';
  } else if (group === EditorConstants.DOOR) {
    pluralStr = 'doors';
    singleStr = 'door';
  } else if (group === EditorConstants.TOILET) {
    pluralStr = 'toilets';
    singleStr = 'toilet';
  } else if (group === EditorConstants.STAIRS) {
    pluralStr = 'stairs';
    singleStr = 'stair';
  } else if (group === EditorConstants.SINK) {
    pluralStr = 'sinks';
    singleStr = 'sink';
  } else if (group === EditorConstants.KITCHEN) {
    pluralStr = 'kitchens';
    singleStr = 'kitchen';
  } else if (group === EditorConstants.OFFICE_MISC) {
    pluralStr = 'office miscs';
    singleStr = 'office misc';
  } else {
    console.error('Group not found: ', group);
  }

  if (plural) {
    return toCapital(pluralStr, firstCapital);
  }

  return toCapital(singleStr, firstCapital);
}
