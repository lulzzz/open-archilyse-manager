export interface Unit {
  unit_id: string;

  name?: string;
  description?: string;

  address?: Object;
  building_id?: string;

  images?: string;

  /** Calculated values */
  layouts?: number;

  /** Control values */
  user_id: string;
  created: string;
  updated: string;
}
