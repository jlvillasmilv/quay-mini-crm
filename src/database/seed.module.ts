import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedOrchestrator } from './seed-orchestrator';
import { RolesSeeder } from './seeders/roles.seeder';
import { PermissionsSeeder } from './seeders/permissions.seeder';
import { AdminSeeder } from './seeders/admin.seeder';
import { User } from '@/users/entities/user.entity';
import { Role } from '@/users/entities/role.entity';
import { Permission } from '@/users/entities/permission.entity';


/**
 * Módulo de datos de arranque (seeds).
 * Garantiza la existencia del usuario administrador por defecto.
 */
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User, Role, Permission])],
  providers: [SeedOrchestrator, RolesSeeder, PermissionsSeeder, AdminSeeder],
})
export class SeedModule {}
