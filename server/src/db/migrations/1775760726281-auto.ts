import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1775760726281 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    await queryRunner.query(
      `CREATE INDEX "user_email_trgm_idx" ON "user" USING gist ("email" gist_trgm_ops)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."user_email_trgm_idx"`);
  }
}
