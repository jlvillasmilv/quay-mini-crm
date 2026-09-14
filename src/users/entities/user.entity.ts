import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from './role.entity';
import { Account } from '@/accounts/entities/account.entity';

/** Tipo de usuario sin el campo sensible `password`. */
export type PublicUser = Omit<User, 'password'>;

/**
 * Entidad de usuarios.
 *
 * Las reglas de validación de entrada viven en los DTOs
 * (ver `user.dto.ts`); esta entidad define únicamente el esquema.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  /** Correo único; se normaliza a minúsculas al crear/consultar. */
  @Column({ unique: true, length: 150 })
  email: string;

  /** Nombre público de usuario. */
  @Column({ length: 150 })
  name: string;

  /** Hash de bcrypt de la contraseña. Nunca debe exponerse en respuestas. */
  @Column({ select: false })
  @Exclude({ toPlainOnly: true })
  password: string;

  /** `true` = activo, `false` = inactivo. El admin inicial se crea activo. */
  @Column({ type: 'boolean', default: false })
  status: boolean;

  /** `null` = email aún no verificado; timestamp = fecha de verificación. */
  @Column({ type: 'timestamp', nullable: true })
  email_verified_at: Date | null;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'users_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => Account, (account) => account.owner)
  ownedAccounts?: Account[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  @Exclude({ toPlainOnly: true })
  update_at: Date;

  @DeleteDateColumn()
  @Exclude()
  deleted_at: Date | null;
}
