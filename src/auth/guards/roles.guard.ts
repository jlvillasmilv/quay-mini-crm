import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleName } from '../constants/roles';
import type { JwtUser } from '../strategies/jwt.strategy';

/**
 * Authorization guard that enforces the roles declared with `@Roles(...)`.
 *
 * Rules:
 * - Routes without `@Roles(...)` metadata are public to any authenticated user.
 * - A user holding the `superadmin` role bypasses every restriction, in any
 *   module, without checking the declared roles.
 * - Otherwise, access is granted when the user holds at least one of the
 *   required roles.
 *
 * Must be used AFTER the JWT guard so that `req.user` is populated.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtUser }>();
    const userRoles = request.user?.roles ?? [];

    // superadmin has no restrictions in any module.
    if (userRoles.includes(RoleName.SUPERADMIN)) {
      return true;
    }

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
