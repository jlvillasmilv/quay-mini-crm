import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccountsTable1789471540646 implements MigrationInterface {
  name = 'CreateAccountsTable1789471540646';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`contacts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`first_name\` varchar(255) NOT NULL, \`last_name\` varchar(255) NOT NULL, \`job_title\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`phone\` varchar(255) NOT NULL, \`social_link\` varchar(255) NULL, \`notes\` varchar(255) NULL, \`account_id\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`update_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`accounts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(150) NOT NULL, \`type\` enum ('prospect', 'customer', 'past_customer') NOT NULL DEFAULT 'prospect', \`record_type\` enum ('B2B', 'B2C') NOT NULL, \`website\` varchar(255) NULL, \`address\` varchar(255) NULL, \`city\` varchar(255) NULL, \`country\` varchar(255) NULL, \`postal_code\` varchar(20) NULL, \`source\` enum ('website', 'referral', 'campaign', 'phone', 'import', 'other') NULL, \`parent_account_id\` int NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`update_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`owner_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`account_shared_users\` (\`accountsId\` int NOT NULL, \`usersId\` int NOT NULL, INDEX \`IDX_7bfbb7dcc07a24c56faaa9eb17\` (\`accountsId\`), INDEX \`IDX_4f3b4ddb8009874e91bff4de03\` (\`usersId\`), PRIMARY KEY (\`accountsId\`, \`usersId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`contacts\` ADD CONSTRAINT \`FK_85bbf0f254d76347a346a8cbb15\` FOREIGN KEY (\`account_id\`) REFERENCES \`accounts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`accounts\` ADD CONSTRAINT \`FK_e6c1947a61f955558ccca3f7c46\` FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_shared_users\` ADD CONSTRAINT \`FK_7bfbb7dcc07a24c56faaa9eb175\` FOREIGN KEY (\`accountsId\`) REFERENCES \`accounts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_shared_users\` ADD CONSTRAINT \`FK_4f3b4ddb8009874e91bff4de03e\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`account_shared_users\` DROP FOREIGN KEY \`FK_4f3b4ddb8009874e91bff4de03e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_shared_users\` DROP FOREIGN KEY \`FK_7bfbb7dcc07a24c56faaa9eb175\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`accounts\` DROP FOREIGN KEY \`FK_e6c1947a61f955558ccca3f7c46\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`contacts\` DROP FOREIGN KEY \`FK_85bbf0f254d76347a346a8cbb15\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_4f3b4ddb8009874e91bff4de03\` ON \`account_shared_users\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_7bfbb7dcc07a24c56faaa9eb17\` ON \`account_shared_users\``,
    );
    await queryRunner.query(`DROP TABLE \`account_shared_users\``);
    await queryRunner.query(`DROP TABLE \`accounts\``);
    await queryRunner.query(`DROP TABLE \`contacts\``);
  }
}
