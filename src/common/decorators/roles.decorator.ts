import { Reflector } from '@nestjs/core';
import { RoleName } from '../constants/roles.constant';

export const Roles = Reflector.createDecorator<RoleName[]>();

// export const ROLES_KEY = 'roles';
// export const Roles = (...roles:) => SetMetadata(ROLES_KEY, roles);
