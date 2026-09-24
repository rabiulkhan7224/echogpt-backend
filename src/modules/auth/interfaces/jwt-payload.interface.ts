import { RoleName } from '@common/constants/roles.constant';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: RoleName[];
  sid?: string; // session id for refresh tokens
}
