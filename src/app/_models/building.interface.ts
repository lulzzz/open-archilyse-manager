/**
 * Entity building from the API
 */
export interface Building {
  is_company_admin?: boolean;
  metadata?: any;

  building_id?: string;
  site_id?: string;

  address?: AddressReference;
  building_references?: BuildingReference[];

  /** Calculated values */
  units?: number;

  /** Control values */
  user_id: string;
  created: string;
  updated: string;
}

/**
 * Address from building
 */
export interface BuildingReference {
  id: string; // Id of the building connected
  source: string; // open_street_maps || swiss_topo
}

/**
 * Address from building
 */
export interface AddressReference {
  city?: string;
  country?: string;
  postal_code?: string;
  street?: string;
  street_nr?: string;
}
