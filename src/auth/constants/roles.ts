/**
 * Canonical role names used across the application.
 *
 * These values must match the role names created by the RolesSeeder.
 */
export enum RoleName {
  /** Has no restrictions in any module; bypasses every role check. */
  SUPERADMIN = 'superadmin',
  /** Full access within the modules it is allowed to manage (e.g. users). */
  ADMIN = 'admin',
  MANAGER = 'manager',
  SALES = 'sales',
}
