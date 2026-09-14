// src/seed/seeders/permissions.seeder.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '@/users/entities/permission.entity';
import { Role } from '@/users/entities/role.entity';

@Injectable()
export class PermissionsSeeder {
  constructor(
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async run(): Promise<void> {
    const existing = await this.permRepo.count();
    if (existing > 0) return;

    // 1. Crear permisos
    const permissions = [
      // Leads
      { name: 'leads:create', module: 'leads', action: 'create' },
      { name: 'leads:read', module: 'leads', action: 'read' },
      { name: 'leads:update', module: 'leads', action: 'update' },
      { name: 'leads:delete', module: 'leads', action: 'delete' },
      // Deals
      { name: 'deals:create', module: 'deals', action: 'create' },
      { name: 'deals:read', module: 'deals', action: 'read' },
      { name: 'deals:update', module: 'deals', action: 'update' },
      { name: 'deals:delete', module: 'deals', action: 'delete' },
      // Orders (eCommerce)
      { name: 'orders:read', module: 'orders', action: 'read' },
      { name: 'orders:update', module: 'orders', action: 'update' },
      { name: 'orders:cancel', module: 'orders', action: 'cancel' },
      // Products
      { name: 'products:create', module: 'products', action: 'create' },
      { name: 'products:read', module: 'products', action: 'read' },
      { name: 'products:update', module: 'products', action: 'update' },
      { name: 'products:delete', module: 'products', action: 'delete' },
      // Invoices
      { name: 'invoices:generate', module: 'invoices', action: 'generate' },
      { name: 'invoices:read', module: 'invoices', action: 'read' },
      // Users (solo admin)
      { name: 'users:manage', module: 'users', action: 'manage' },
    ];

    const savedPerms = await this.permRepo.save(
      this.permRepo.create(permissions),
    );

    // 2. Asignar permisos a roles
    const superadmin = await this.roleRepo.findOneBy({ name: 'superadmin' });
    const admin = await this.roleRepo.findOneBy({ name: 'admin' });
    const manager = await this.roleRepo.findOneBy({ name: 'manager' });
    const sales = await this.roleRepo.findOneBy({ name: 'sales' });

    // superadmin has unrestricted access: it receives every permission.
    if (superadmin) {
      superadmin.permissions = savedPerms;
      await this.roleRepo.save(superadmin);
    }

    if (admin) {
      admin.permissions = savedPerms;
      await this.roleRepo.save(admin);
    }

    if (manager) {
      manager.permissions = savedPerms.filter((p) => p.name !== 'users:manage');
      await this.roleRepo.save(manager);
    }

    if (sales) {
      const salesPerms = [
        'leads:create',
        'leads:read',
        'leads:update',
        'deals:create',
        'deals:read',
        'deals:update',
        'products:read',
      ];
      sales.permissions = savedPerms.filter((p) => salesPerms.includes(p.name));
      await this.roleRepo.save(sales);
    }
  }
}
