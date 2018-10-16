/**
 * Entity unit from the API
 */
export interface Unit {
  unit_id: string;

  name?: string;
  description?: string;

  address?: AddressUnitReference;
  building_id?: string;

  images?: string;

  /** Calculated values */
  layouts?: number;

  /** Control values */
  user_id: string;
  created: string;
  updated: string;
}

export interface AddressUnitReference {
  floor_nr?: number;
  additional?: string;
}
