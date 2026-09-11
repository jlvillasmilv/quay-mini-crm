// accounts.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Account,
  AccountType,
  AccountRecordType,
} from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PaginateQuery, paginate, Paginated } from 'nestjs-paginate';
import { User } from '@/users/entities/user.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private repo: Repository<Account>,
  ) {}

  async create(dto: CreateAccountDto): Promise<Account> {
    // Validar según recordType
    if (dto.recordType === AccountRecordType.BUSINESS && !dto.name) {
      throw new BadRequestException(
        'name es obligatorio para recordType BUSINESS',
      );
    }
    if (
      dto.recordType === AccountRecordType.PERSON &&
      (!dto.firstName || !dto.lastName)
    ) {
      throw new BadRequestException(
        'firstName y lastName son obligatorios para recordType PERSON',
      );
    }

    const account = this.repo.create(dto);
    return this.repo.save(account);
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Account>> {
    return await paginate(query, this.repo, {
      sortableColumns: ['id', 'name', 'created_at'],
      searchableColumns: ['name'],
      defaultSortBy: [['name', 'ASC']],
      defaultLimit: 10,
    });
  }

  async findOne(id: string, currentUser: User): Promise<Account> {
    const account = await this.repo.findOne({
      where: { id },
      relations: { owner: true, contacts: true, opportunities: true },
    });
    if (!account) throw new NotFoundException('Account no encontrado');

    // RBAC: sales_rep solo ve sus accounts
    if (
      currentUser.role === UserRole.SALES_REP &&
      account.ownerId !== currentUser.id
    ) {
      throw new NotFoundException('Account no encontrado');
    }

    return account;
  }

  async update(id: string, dto: UpdateAccountDto): Promise<Account> {
    const account = await this.repo.findOne({ where: { id } });
    if (!account) throw new NotFoundException('Account no encontrado');

    Object.assign(account, dto);
    return this.repo.save(account);
  }

  async remove(id: string): Promise<void> {
    const account = await this.repo.findOne({ where: { id } });
    if (!account) throw new NotFoundException('Account no encontrado');
    await this.repo.softDelete(account);
  }

  // ─── Método clave: convertir prospect → customer ───
  async markAsCustomer(id: string): Promise<Account> {
    const account = await this.repo.findOne({ where: { id } });
    if (!account) throw new NotFoundException('Account no encontrado');

    account.type = AccountType.CUSTOMER;
    return this.repo.save(account);
  }
}
