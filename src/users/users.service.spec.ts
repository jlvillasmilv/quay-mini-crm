import { ConflictException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';

// Avoid loading the native bcrypt binding; a lightweight mock is enough here.
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

/** Minimal shape of the repositories consumed by UsersService. */
interface MockRepository {
  create: jest.Mock;
  save: jest.Mock;
  findOne: jest.Mock;
  findOneOrFail: jest.Mock;
  findBy: jest.Mock;
  softDelete: jest.Mock;
}

const createMockRepository = (): MockRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  findBy: jest.fn(),
  softDelete: jest.fn(),
});

const buildRole = (overrides: Partial<Role> = {}): Role =>
  ({
    id: 'role-admin',
    name: 'admin',
    description: 'Admin role',
    permissions: [],
    users: [],
    ...overrides,
  });

const buildUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 1,
    email: 'user@example.com',
    name: 'John Doe',
    password: 'hashed-password',
    status: true,
    email_verified_at: new Date(),
    roles: [],
    created_at: new Date(),
    update_at: new Date(),
    deleted_at: null,
    ...overrides,
  });

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: MockRepository;
  let rolesRepository: MockRepository;

  beforeEach(() => {
    jest.clearAllMocks();

    usersRepository = createMockRepository();
    rolesRepository = createMockRepository();

    service = new UsersService(
      usersRepository as unknown as Repository<User>,
      rolesRepository as unknown as Repository<Role>,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('loads the roles relation', async () => {
      const user = buildUser();
      usersRepository.findOneOrFail.mockResolvedValue(user);

      await service.findOne(1);

      expect(usersRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { roles: true },
      });
    });
  });

  describe('update', () => {
    it('replaces previous roles with the newly assigned ones', async () => {
      const adminRole = buildRole({ id: 'role-admin', name: 'admin' });
      const salesRole = buildRole({ id: 'role-sales', name: 'sales' });
      const user = buildUser({ roles: [adminRole] });

      usersRepository.findOneOrFail.mockResolvedValue(user);
      usersRepository.save.mockResolvedValue(user);
      rolesRepository.findBy.mockResolvedValue([salesRole]);

      await service.update(1, { roleIds: ['role-sales'] });

      expect(usersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ roles: [salesRole] }),
      );
      expect(user.roles).toEqual([salesRole]);
      expect(user.roles).not.toContainEqual(adminRole);
    });

    it('clears all roles when an empty roleIds array is sent', async () => {
      const user = buildUser({ roles: [buildRole()] });
      usersRepository.findOneOrFail.mockResolvedValue(user);
      usersRepository.save.mockResolvedValue(user);

      await service.update(1, { roleIds: [] });

      expect(rolesRepository.findBy).not.toHaveBeenCalled();
      expect(user.roles).toEqual([]);
    });

    it('keeps current roles when roleIds is not sent', async () => {
      const adminRole = buildRole();
      const user = buildUser({ roles: [adminRole] });
      usersRepository.findOneOrFail.mockResolvedValue(user);
      usersRepository.save.mockResolvedValue(user);

      await service.update(1, { name: 'New Name' });

      expect(user.name).toBe('New Name');
      expect(user.roles).toEqual([adminRole]);
      expect(rolesRepository.findBy).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when a role id does not exist', async () => {
      const user = buildUser();
      usersRepository.findOneOrFail.mockResolvedValue(user);
      rolesRepository.findBy.mockResolvedValue([]);

      await expect(
        service.update(1, { roleIds: ['missing-role'] }),
      ).rejects.toThrow(NotFoundException);
      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('hashes the password when provided', async () => {
      const user = buildUser();
      usersRepository.findOneOrFail.mockResolvedValue(user);
      usersRepository.save.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

      await service.update(1, { password: 'Pm12345678' });

      expect(bcrypt.hash).toHaveBeenCalledWith('Pm12345678', 10);
      expect(user.password).toBe('new-hash');
    });

    it('throws ConflictException when the new email is taken by another user', async () => {
      const user = buildUser({ email: 'current@example.com' });
      usersRepository.findOneOrFail.mockResolvedValue(user);
      usersRepository.findOne.mockResolvedValue(buildUser({ id: 2 }));

      await expect(
        service.update(1, { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('does not check email uniqueness when the email is unchanged', async () => {
      const user = buildUser({ email: 'same@example.com' });
      usersRepository.findOneOrFail.mockResolvedValue(user);
      usersRepository.save.mockResolvedValue(user);

      await service.update(1, { email: 'same@example.com' });

      expect(usersRepository.findOne).not.toHaveBeenCalled();
    });

    it('returns the user with its persisted roles after saving', async () => {
      const adminRole = buildRole({ id: 'role-admin' });
      const user = buildUser({ roles: [adminRole] });
      usersRepository.findOneOrFail.mockResolvedValue(user);
      usersRepository.save.mockResolvedValue(user);
      rolesRepository.findBy.mockResolvedValue([adminRole]);

      const result = await service.update(1, { roleIds: ['role-admin'] });

      expect(result.roles).toEqual([adminRole]);
      // findOne runs once at the start and once to reload the relations.
      expect(usersRepository.findOneOrFail).toHaveBeenCalledTimes(2);
    });
  });
});
