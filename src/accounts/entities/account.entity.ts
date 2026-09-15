import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';

import { Contact } from '@/contacts/entities/contact.entity';
import { User } from '@/users/entities/user.entity';

export enum AccountType {
  PROSPECT = 'prospect', // Not yet a customer
  CUSTOMER = 'customer', // Has closed at least one sale
  PAST_CUSTOMER = 'past_customer', // Has churned / is inactive
}

export enum AccountRecordType {
  BUSINESS = 'B2B', // Business (B2B)
  PERSON = 'B2C', // Person (B2C)
}

export enum LeadSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  CAMPAIGN = 'campaign',
  PHONE = 'phone',
  IMPORT = 'import',
  OTHER = 'other',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'enum', enum: AccountType, default: AccountType.PROSPECT })
  type: AccountType;

  @Column({ type: 'enum', enum: AccountRecordType })
  record_type: AccountRecordType;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true, length: 20 })
  postal_code: string;

  @Column({ type: 'enum', enum: LeadSource, nullable: true })
  source: LeadSource;

  // ─── Jerarquía (matriz / filial) ───
  @Column({ nullable: true })
  parent_account_id: number;

  @ManyToOne(() => User, (u) => u.ownedAccounts)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  // ─── Equipo compartido (N:N) ───
  @ManyToMany(() => User)
  @JoinTable({ name: 'account_shared_users' })
  sharedWith: User[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  update_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @OneToMany(() => Contact, (c) => c.account)
  contacts: Contact[];
}
