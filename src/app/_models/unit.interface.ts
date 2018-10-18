/**
 * Entity unit from the API
 */
export interface Unit {
  /** id of the unit */
  unit_id: string;

  /** name of the unit */
  name?: string;

  /** description of the unit */
  description?: string;

  /** Address object details */
  address?: AddressUnitReference;

  /** building that the unit belongs to */
  building_id?: string;

  /** string with images of the unit */
  images?: string;

  /** Calculated values */
  layouts?: number;

  /**
   * Control values
   * */

  /** User that modified the date for the last time  */
  user_id: string;
  /** Unit creation date  */
  created: string;
  /** Last update date  */
  updated: string;
}

/**
 * The address of a unit is defined by a floor_nr and additional information
 */
export interface AddressUnitReference {
  /** Floor starting in 1, important to calculate real view */
  floor_nr?: number;

  /** Free additional information for the address */
  additional?: string;
}
