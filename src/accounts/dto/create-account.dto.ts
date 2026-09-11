import { IsString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import {
  AccountRecordType,
  AccountType,
  LeadSource,
} from '../entities/account.entity';

export class CreateAccountDto {
  @IsEnum(AccountRecordType)
  recordType: AccountRecordType;

  @IsEnum(AccountType)
  @IsOptional()
  type?: AccountType;

  // B2B
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  employeeCount?: number;

  @IsString()
  @IsOptional()
  website?: string;

  // B2C
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  // Comunes
  @IsString()
  @IsOptional()
  address?: string;
  @IsString()
  @IsOptional()
  city?: string;
  @IsString()
  @IsOptional()
  country?: string;
  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @IsString()
  @IsOptional()
  parentAccountId?: string;

  @IsString()
  ownerId: string;
}
