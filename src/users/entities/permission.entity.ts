import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 50 })
  module: string; // 'leads', 'orders', 'products', etc.

  @Column({ length: 20 })
  action: string; // 'create', 'read', 'update', 'delete'

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
