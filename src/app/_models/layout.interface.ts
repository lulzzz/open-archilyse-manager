import { Movement } from './movement.interface';

export interface Layout {
  unit_id?: string;

  name?: string;
  description?: string;
  images?: string;
  movements?: Movement[];

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
