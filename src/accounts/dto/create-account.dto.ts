import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  MaxLength,
} from 'class-validator';
import {
  AccountRecordType,
  AccountType,
  LeadSource,
} from '../entities/account.entity';

export class CreateAccountDto {
  @IsEnum(AccountRecordType)
  record_type: AccountRecordType;

  @IsEnum(AccountType)
  @IsOptional()
  type?: AccountType;

  // B2B
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  website?: string;

  // B2C
  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

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
  @MaxLength(20)
  postal_code?: string;

  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @IsString()
  @IsOptional()
  parent_account_id?: string;

  @IsNumber()
  @IsOptional()
  owner_id?: number;
}
