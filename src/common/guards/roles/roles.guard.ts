// import { Roles } from '@/common/decorators/roles.decorator';
// import {
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
//   Injectable,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { Observable } from 'rxjs';

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private readonly reflector: Reflector) {}
//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const required = this.reflector.getAllAndOverride(Roles, [
//       context.getHandler(),
//       context.getClass(),
//     ]);

//     const user: AuthenticatedUser | undefined = context
//       .switchToHttp()
//       .getRequest().user;

//     if (!user) throw new ForbiddenException('No authenticated user');

//     const has = required.some((r) => user.roles.includes(r));
//     if (!has) throw new ForbiddenException('Insufficient permissions');

//     return true;
//   }
// }
