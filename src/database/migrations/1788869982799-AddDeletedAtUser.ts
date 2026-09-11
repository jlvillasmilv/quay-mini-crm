import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedAtUser1788869982799 implements MigrationInterface {
  name = 'AddDeletedAtUser1788869982799';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`deleted_at\` datetime(6) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`deleted_at\``);
  }
}
