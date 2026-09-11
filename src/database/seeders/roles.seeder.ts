import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@/users/entities/role.entity';

@Injectable()
export class RolesSeeder {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async run(): Promise<void> {
    const existing = await this.roleRepo.count();
    if (existing > 0) return; // idempotente: no re-seed

    const roles = [
      { name: 'superadmin', description: 'Acceso total al sistema' },
      { name: 'admin', description: 'Acceso total al sistema' },
      { name: 'manager', description: 'Gestión de leads, deals y clientes' },
      { name: 'sales', description: 'Gestión básica de leads y deals' },
    ];

    await this.roleRepo.save(this.roleRepo.create(roles));
  }
}
