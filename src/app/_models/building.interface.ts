/**
 * Entity building from the API
 */
export interface Building {
  /** id of the building */
  building_id: string;

  /** name of the building */
  name?: string;

  /** description of the building */
  description?: string;

  /** site that the building belongs to */
  site_id?: string;

  /** Building address details, necessary to georeference the building*/
  address?: AddressReference;

  /** In each source we connect to an building_id from that source */
  building_references?: BuildingReference[];

  /** Calculated values */
  units?: number;

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
 * Address from building
 */
export interface BuildingReference {
  /** Id of the building connected, comes from the surroundings API call */
  id: string;

  /** Source of data, currently: open_street_maps || swiss_topo */
  source: string;
}

/**
 * Address from building
 */
export interface AddressReference {
  /** City of the building */
  city?: string;
  /** Country of the building */
  country?: string;
  /** Postal Code of the building */
  postal_code?: string;
  /** Street of the building */
  street?: string;
  /** Street nr of the building */
  street_nr?: string;
}
