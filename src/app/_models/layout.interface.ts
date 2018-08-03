import { Movement } from './movement.interface';

export interface Layout {
  unit_id?: string;

  name?: string;
  description?: string;
  images?: string;
  movements?: Movement[];

  /** Control values */
  user_id: string;
  created: string;
  updated: string;
}
