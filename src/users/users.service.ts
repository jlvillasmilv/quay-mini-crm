import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { PaginateQuery, paginate, Paginated } from 'nestjs-paginate';
import { Role } from './entities/role.entity';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.checkEmailAvailable(createUserDto.email);
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      BCRYPT_ROUNDS,
    );

    const { roleIds, ...userData } = createUserDto;
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      roles: roleIds?.length ? await this.findRolesByIds(roleIds) : [],
    });

    await this.usersRepository.save(user);
    return user;
  }

  /**
   * Loads the roles matching the given ids, throwing a 404 if any id is unknown.
   */
  private async findRolesByIds(roleIds: string[]): Promise<Role[]> {
    const roles = await this.rolesRepository.findBy({ id: In(roleIds) });
    if (roles.length !== roleIds.length) {
      const found = new Set(roles.map((role) => role.id));
      const missing = roleIds.filter((id) => !found.has(id));
      throw new NotFoundException(
        `Roles no encontrados: ${missing.join(', ')}`,
      );
    }
    return roles;
  }

  /**
   * Returns all available roles so clients can pick one when creating a user.
   */
  async findAllRoles(): Promise<Role[]> {
    return this.rolesRepository.find({ order: { name: 'ASC' } });
  }

  async findAll(query: PaginateQuery): Promise<Paginated<User>> {
    return await paginate(query, this.usersRepository, {
      sortableColumns: ['id', 'name', 'created_at'],
      searchableColumns: ['name'],
      defaultSortBy: [['name', 'ASC']],
      defaultLimit: 10,
    });
  }

  async findOne(id: number): Promise<User> {
    return await this.usersRepository.findOneOrFail({
      where: { id },
      relations: { roles: true },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const { roleIds, password, ...userData } = updateUserDto;

    // Validate email uniqueness only when it is being changed.
    if (userData.email && userData.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: {
          email: userData.email,
          id: Not(id),
        },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use by another user');
      }
    }

    Object.assign(user, userData);

    // Hash password only if provided.
    if (password) {
      user.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
    }

    // Replace the whole role set when `roleIds` is sent, so previous roles
    // are not kept. An empty array removes all roles.
    if (roleIds !== undefined) {
      user.roles = roleIds.length ? await this.findRolesByIds(roleIds) : [];
    }

    await this.usersRepository.save(user);

    // Reload to return the persisted relations (roles) in the response.
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.softDelete(id);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Finds a user by email including the password hash.
   *
   * The `password` column is declared with `select: false`, so it must be
   * explicitly selected. Use it only for authentication flows; never return
   * the resulting entity directly to a client.
   */
  async findOneByEmailWithPassword(email: string): Promise<User | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: email.toLowerCase() })
      .getOne();
  }

  async checkEmailAvailable(email: string) {
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }
    return true;
  }

  /**
   * Actualiza campos arbitrarios del usuario (uso interno).
   * Acepta cualquier campo de la entidad, p.ej. `password` o `email_verified_at`.
   */
  async updateValue(id: string, field: Partial<User>): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    Object.assign(user, field);
    return await this.usersRepository.save(user);
  }
}
