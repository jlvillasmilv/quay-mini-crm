import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Role } from '@/users/entities/role.entity';
import * as bcrypt from 'bcrypt';

/**
 * Seeder default admin user.
 *
 * Execute to seed the application (after TypeORM synchronizes
 * the schema in development), ensuring that the `users` table always
 * contains the `admin@example.com` user with the configured password.
 *
 */
@Injectable()
export class AdminSeeder {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async run(): Promise<void> {
    const email = 'admin@example.com';
    const password = '12345678';

    const existing = await this.userRepo.findOneBy({ email });
    if (existing) {
      this.logger.log(`Admin user "${email}" ya existe, se omite el seed.`);
      return;
    }
    // El admin necesita el rol "admin" → por eso se ejecuta DESPUÉS de roles
    const adminRole = await this.roleRepo.findOneBy({ name: 'superadmin' });

    const user = this.userRepo.create({
      email,
      name: 'Administrator',
      password: await bcrypt.hash(password, 10),
      status: true,
      email_verified_at: new Date(),
      roles: adminRole ? [adminRole] : [],
    });

    await this.userRepo.save(user);
    this.logger.log(`Usuario administrador por defecto creado: ${email}`);
  }
}
