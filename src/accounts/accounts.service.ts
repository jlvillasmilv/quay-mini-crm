import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Account,
  AccountType,
  AccountRecordType,
} from './entities/account.entity';
import { Contact } from '@/contacts/entities/contact.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PaginateQuery, paginate, Paginated } from 'nestjs-paginate';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly repo: Repository<Account>,
    private readonly dataSource: DataSource,
  ) { }

  /**
   * Creates a new Account entity within a database transaction.
   * If the account recordType is B2B (BUSINESS) and contact details
   * (first_name, last_name, email, phone) are provided, an associated Contact
   * entity is automatically created and linked to the account.
   *
   * @param dto - Data transfer object containing details for creating the account.
   * @returns The saved Account entity.
   * @throws BadRequestException if recordType is BUSINESS and name is missing.
   */
  async create(dto: CreateAccountDto): Promise<Account> {
    if (dto.recordType === AccountRecordType.BUSINESS && !dto.name) {
      throw new BadRequestException(
        'name es obligatorio para recordType BUSINESS',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const {
        record_type,
        first_name,
        last_name,
        email,
        phone,
        owner_id,
        parent_account_id,
        ...accountProps
      } = dto;

      const account = manager.create(Account, {
        ...accountProps,
        parent_account_id: parent_account_id
          ? Number(parent_account_id)
          : undefined,
        ...(owner_id ? { owner: { id: owner_id } as any } : {}),
      });

      const savedAccount = await manager.save(account);

      if (dto.record_type === AccountRecordType.BUSINESS) {
        if (first_name || last_name || email || phone) {
          const contact = manager.create(Contact, {
            first_name: first_name ?? '',
            last_name: last_name ?? '',
            email: email ?? '',
            phone: phone ?? '',
            account_id: savedAccount.id,
          });
          await manager.save(contact);
        }
      }

      return savedAccount;
    });
  }

  /**
   * Retrieves a paginated list of accounts based on query parameters.
   *
   * @param query - Pagination and filtering options from nestjs-paginate.
   * @returns Paginated result set containing accounts.
   */
  async findAll(query: PaginateQuery): Promise<Paginated<Account>> {
    return await paginate(query, this.repo, {
      sortableColumns: ['id', 'name', 'created_at'],
      searchableColumns: ['name'],
      defaultSortBy: [['name', 'ASC']],
      defaultLimit: 10,
    });
  }

  /**
   * Finds a single Account by its unique identifier.
   *
   * @param id - Unique identifier of the Account.
   * @returns The found Account entity including relations.
   * @throws NotFoundException if the account is not found.
   */
  async findOne(id: number): Promise<Account> {
    const account = await this.repo.findOne({
      where: { id },
      relations: { owner: true, contacts: true },
    });
    if (!account) throw new NotFoundException('Account no encontrado');

    return account;
  }

  /**
   * Updates an existing Account entity.
   *
   * @param id - Unique identifier of the Account to update.
   * @param dto - Data transfer object with updated values.
   * @returns The updated Account entity.
   */
  async update(id: number, dto: UpdateAccountDto): Promise<Account> {
    const account = await this.findOne(id);

    Object.assign(account, dto);
    return this.repo.save(account);
  }

  /**
   * Soft deletes an Account by its unique identifier.
   *
   * @param id - Unique identifier of the Account to remove.
   */
  async remove(id: number): Promise<void> {
    const account = await this.findOne(id);
    await this.repo.softDelete(account.id);
  }

  /**
   * Marks an existing Account as a customer.
   *
   * @param id - Unique identifier of the Account.
   * @returns The updated Account entity with type CUSTOMER.
   */
  async markAsCustomer(id: number): Promise<Account> {
    const account = await this.findOne(id);

    account.type = AccountType.CUSTOMER;
    return this.repo.save(account);
  }
}

