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

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly repo: Repository<Account>,
  ) {}

  async create(dto: CreateAccountDto): Promise<Account> {
    if (dto.recordType === AccountRecordType.BUSINESS && !dto.name) {
      throw new BadRequestException(
        'name es obligatorio para recordType BUSINESS',
      );
    }

    const account = this.repo.create(dto as unknown as Partial<Account>);
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

  async findOne(id: number): Promise<Account> {
    const account = await this.repo.findOne({
      where: { id },
      relations: { owner: true, contacts: true },
    });
    if (!account) throw new NotFoundException('Account no encontrado');

    return account;
  }

  async update(id: number, dto: UpdateAccountDto): Promise<Account> {
    const account = await this.findOne(id);

    Object.assign(account, dto);
    return this.repo.save(account);
  }

  async remove(id: number): Promise<void> {
    const account = await this.findOne(id);
    await this.repo.softDelete(account.id);
  }

  async markAsCustomer(id: number): Promise<Account> {
    const account = await this.findOne(id);

    account.type = AccountType.CUSTOMER;
    return this.repo.save(account);
  }
}
