import { Movement } from './movement.interface';

/**
 * Entity layout from the API
 */
export interface Layout {
  layout_id: string;
  unit_id?: string;

  name?: string;
  description?: string;
  images?: string;
  movements?: Movement[];
  floors?: Floor[];

  model_structure?: ModelStructure;

  /** Control values */
  user_id: string;
  created: string;
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
  floor_nr: number;
  source: string;
}
