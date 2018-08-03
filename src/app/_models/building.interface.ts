export interface Building {
  is_company_admin?: boolean;
  metadata?: any;

  building_id?: string;
  site_id?: string;

  address?: Object;

  /** Calculated values */
  units?: number;

  /** Control values */
  user_id: string;
  created: string;
  updated: string;
}
