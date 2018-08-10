export interface Site {
  name: string;
  description: string;
  site_id: string;

  /** Calculated values */
  buildings?: number;

  /** Control values */
  user_id: string;
  created: string;
  updated: string;
}
