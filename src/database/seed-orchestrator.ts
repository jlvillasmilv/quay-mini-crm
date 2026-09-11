
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { RolesSeeder } from './seeders/roles.seeder';
import { PermissionsSeeder } from './seeders/permissions.seeder';
import { AdminSeeder } from './seeders/admin.seeder';

@Injectable()
export class SeedOrchestrator implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedOrchestrator.name);

  constructor(
    private readonly rolesSeeder: RolesSeeder,
    private readonly permissionsSeeder: PermissionsSeeder,
    private readonly adminSeeder: AdminSeeder,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Starting database seeds...');

    // Orden estricto: roles → permisos → admin
    await this.rolesSeeder.run();
    this.logger.log('✓ Roles seeded');

    await this.permissionsSeeder.run();
    this.logger.log('✓ Permissions seeded');

    await this.adminSeeder.run();
    this.logger.log('✓ Admin user seeded');

    this.logger.log('All seeds completed.');
  }
}
