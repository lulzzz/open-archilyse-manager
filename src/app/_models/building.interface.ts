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

export interface BuildingReference {
  id: string;
  source: string;
}

export interface AddressReference {
  city?: string;
  country?: string;
  postal_code?: string;
  street?: string;
  street_nr?: string;
}
