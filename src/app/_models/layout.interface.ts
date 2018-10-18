import { Movement } from './movement.interface';

/**
 * Entity layout from the API
 */
export interface Layout {
  /** id of the layout */
  layout_id: string;

  /** name of the layout */
  name?: string;

  /** description of the layout */
  description?: string;

  /** unit that the layout belongs to */
  unit_id?: string;

  /** string with images of the unit */
  images?: string;

  /** Layout geoureference movements */
  movements?: Movement[];

  /** Each floor source array */
  floors?: Floor[];

  /** Digitalized version of the layout, floor array each of them with a tree structure */
  model_structure?: ModelStructure;

  /**
   * Control values
   **/

  /** User that modified the date for the last time  */
  user_id: string;
  /** Unit creation date  */
  created: string;
  /** Last update date  */
  updated: string;
}

/**
 * Model structure is a recursive tree describing a digitalized Layout
 * The model structure is divided into floors
 */
export interface ModelStructure {
  id: string;
  type: string; // Type of the described unit
  floors: FloorStructure[];
}

/**
 * Definition of each of the floors from a Model structure
 */
export interface FloorStructure {
  id: string;
  type: string;
  floors?: ElementStructure[];
}

/**
 * Definition of each of the elements from a Floor structure
 */
export interface ElementStructure {
  id: string;
  type: string;
  children?: ElementStructure[]; // Recursive structure
  dim?: number[];
  direction?: any;
  footprint?: any; // Coordinates of the floor projection of the element
  height?: number[];
}

/**
 * Definition of each of the SOURCE of each floor of a layout
 * Floor number and ID or URL to the specific data.
 */
export interface Floor {
  /** the floor the data belongs to */
  floor_nr: number;

  /** ID or URL to the original data source*/
  source: string;
}
