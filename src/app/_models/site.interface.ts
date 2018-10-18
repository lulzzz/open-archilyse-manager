/**
 * Entity site from the API
 */
export interface Site {


  /** id of the site */
  site_id: string;

  /** name of the site */
  name?: string;

  /** description of the site */
  description?: string;

  /** Calculated values */
  buildings?: number;

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
