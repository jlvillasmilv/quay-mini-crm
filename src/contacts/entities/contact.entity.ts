import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from '@/accounts/entities/account.entity';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  job_title: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  social_link: string;

  @Column({ nullable: true })
  notes: string;

  // FK → Account (la relación 1:N)
  @Column()
  account_id: number;

  @ManyToOne(() => Account, (a) => a.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  update_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
