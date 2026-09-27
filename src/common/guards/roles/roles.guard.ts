import { RoleName } from '@/common/constants/roles.constant';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { AuthenticatedUser } from '@/common/interfaces/authenticated-user.interface';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 1. Skip public routes — no auth, no roles
    const isPublic = this.reflector.getAllAndOverride<boolean>(Public, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // 2. Skip routes that don't declare @Roles()
    const required = this.reflector.getAllAndOverride<RoleName[]>(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    // 3. Only now enforce auth + role
    const user: AuthenticatedUser | undefined = context
      .switchToHttp()
      .getRequest().user;

    if (!user) throw new ForbiddenException('No authenticated user');

    const has = required.some((r) => user.roles.includes(r));
    if (!has) throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}
