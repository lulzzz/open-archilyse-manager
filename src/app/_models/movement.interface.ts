export interface Movement {
  source?: string;
  angle: number;

  x_off: number;
  y_off: number;
  z_off: number;

  x_pivot: number;
  y_pivot: number;
  z_pivot: number;
}
