import { SetMetadata } from '@nestjs/common';

/** Metadata key used by RolesGuard to read the roles required by a route. */
export const ROLES_KEY = 'roles';

/**
 * Declares the roles allowed to access a route or controller.
 *
 * A user with the `superadmin` role always passes, regardless of the roles
 * listed here (see RolesGuard).
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
