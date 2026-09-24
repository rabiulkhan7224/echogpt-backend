import { RoleName } from '../constants/roles.constant';

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: RoleName[];
}
