/**
 * Layout movements when georeferenced
 * Layout.movements property
 */
export interface Movement {
  /** Source of data, currently: open_street_maps || swiss_topo */
  source?: string;

  /** angle to be turn the element */
  angle: number;

  /** x offset from the center of coordinates */
  x_off: number;
  /** y offset from the center of coordinates */
  y_off: number;
  /** z offset from the center of coordinates */
  z_off: number;

  /** x coordinate to apply the rotation angle */
  x_pivot: number;
  /** y coordinate to apply the rotation angle */
  y_pivot: number;
}
