export interface User {
  user_id?: string;
  name?: string;
  email?: string;
  password?: string;
  balance?: number;
  simulation_weights?: Object;
  is_company_admin?: boolean;
  metadata?: any;
}
