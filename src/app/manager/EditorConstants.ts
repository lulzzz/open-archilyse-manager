export class EditorConstants {
  /**
   * MOVEMENT TYXPES
   */
  static SIZE = 10;
  static MOVE = 20;
  static ROTATE = 30;

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
