import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { RoleName } from '../constants/roles';
import type { JwtUser } from '../strategies/jwt.strategy';

const createContext = (user?: JwtUser): ExecutionContext =>
  ({
    getHandler: () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

const buildUser = (roles: string[]): JwtUser => ({
  id: 1,
  email: 'user@example.com',
  name: 'John Doe',
  roles,
});

describe('RolesGuard', () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('allows access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createContext(buildUser([])))).toBe(true);
  });

  it('allows a user holding one of the required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleName.ADMIN]);

    expect(guard.canActivate(createContext(buildUser([RoleName.ADMIN])))).toBe(
      true,
    );
  });

  it('denies a user that does not hold any required role', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleName.ADMIN]);

    expect(
      guard.canActivate(createContext(buildUser([RoleName.MANAGER]))),
    ).toBe(false);
  });

  it('denies a user with no roles', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleName.ADMIN]);

    expect(guard.canActivate(createContext(buildUser([])))).toBe(false);
  });

  it('lets superadmin bypass a required role it does not hold', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleName.ADMIN]);

    expect(
      guard.canActivate(createContext(buildUser([RoleName.SUPERADMIN]))),
    ).toBe(true);
  });

  it('lets superadmin pass regardless of the required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleName.SALES]);

    expect(
      guard.canActivate(createContext(buildUser([RoleName.SUPERADMIN]))),
    ).toBe(true);
  });
});
