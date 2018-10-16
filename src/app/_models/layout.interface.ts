import { Movement } from './movement.interface';

/**
 * Entity layout from the API
 */
export interface Layout {
  layout_id: string;
  unit_id?: string;

  name?: string;
  description?: string;
  images?: string;
  movements?: Movement[];
  floors?: Floor[];

  model_structure?: ModelStructure;

  /** Control values */
  user_id: string;
  created: string;
  updated: string;
}

export interface ModelStructure {
  id: string;
  type: string;
  is_office: boolean;
  children: Object[];
}

export interface Floor {
  floor_nr: number;
  source: string;
}
