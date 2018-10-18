/**
 * Fixed constants used in the editor
 * Movements - for the User controls.
 * Model structure Types - to understand the model structure
 */
export class EditorConstants {
  /** **********************************************
   * MOVEMENT TYPES
   */

  /** Scaling edition */
  static SIZE = 10;
  /** Movement edition */
  static MOVE = 20;
  /** Rotation edition */
  static ROTATE = 30;

  /** **********************************************
   * MODEL STRUCTURE TYPES
   */

  /** Generic area */
  static AREA = 'AREA';
  /** Area of difference value */
  static AREA_DIFF = 'AREA_DIFF';
  /** Wall of the floorplan */
  static WALL = 'WALL';

  /**  **********************************************
   * Features
   * */

  /** Feature  Toilet  */
  static TOILET = 'FeatureType.TOILET';
  /** Feature  Stairs  */
  static STAIRS = 'FeatureType.STAIRS';
  /** Feature  Sink  */
  static SINK = 'FeatureType.SINK';
  /** Feature  Kitchen  */
  static KITCHEN = 'FeatureType.KITCHEN';
  /** Feature  Desk  */
  static DESK = 'FeatureType.DESK';
  /** Feature  Chair  */
  static CHAIR = 'FeatureType.CHAIR';
  /** Feature  Office misc  */
  static OFFICE_MISC = 'FeatureType.OFFICE_MISC';
  /** Feature  Misc  */
  static MISC = 'FeatureType.MISC';

  /** **********************************************
   *  Separators
   *  */

  /** Separator Envelope */
  static ENVELOPE = 'SeparatorType.ENVELOPE';
  /** Separator Railing */
  static RAILING = 'SeparatorType.RAILING';
  /** Separator not defined */
  static SEPARATOR_NOT_DEFINED = 'SeparatorType.NOT_DEFINED';

  /** **********************************************
   *  AreaType
   *  */

  /** Area type Bathroom */
  static BATHROOM = 'AreaType.BATHROOM';
  /** Area type Area_kitchen */
  static AREA_KITCHEN = 'AreaType.KITCHEN';
  /** Area type Area_kitchen_dining */
  static AREA_KITCHEN_DINING = 'AreaType.KITCHEN_DINING';
  /** Area type Area_not_defined */
  static AREA_NOT_DEFINED = 'AreaType.NOT_DEFINED';
  /** Area type Shaft */
  static SHAFT = 'AreaType.SHAFT';
  /** Area type Balcony */
  static BALCONY = 'AreaType.BALCONY';
  /** Area type Corridor */
  static CORRIDOR = 'AreaType.CORRIDOR';
  /** Area type Storeroom */
  static STOREROOM = 'AreaType.STOREROOM';
  /** Area type Room */
  static ROOM = 'AreaType.ROOM';
  /** Area type Dining */
  static DINING = 'AreaType.DINING';

  /** **********************************************
   * SpaceType
   * */
  static SPACE_NOT_DEFINED = 'SpaceType.NOT_DEFINED';

  /** **********************************************
   *  OpeningType
   *  */
  static DOOR = 'OpeningType.DOOR';
  static WINDOW_ENVELOPE = 'OpeningType.WINDOW_ENVELOPE';
  static WINDOW_INTERIOR = 'OpeningType.WINDOW_INTERIOR';

  static to_be_filled = 'to be filled';
}

/**
 * Transforms the first letter to uppercase when firstCapital is true
 * @param txt
 * @param firstCapital
 */
export function toCapital(txt, firstCapital) {
  if (firstCapital) {
    return txt.substr(0, 1).toUpperCase() + txt.substr(1, txt.length - 1);
  }
  return txt;
}

/**
 * Returns a string identifying the specific group
 * @param group
 * @param plural
 * @param firstCapital
 */
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
