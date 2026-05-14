import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1778766154886 implements MigrationInterface {
    name = 'Auto1778766154886'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."user_email_trgm_idx"`);
        await queryRunner.query(`ALTER TABLE "file_relation" ADD "team_id" uuid`);
        await queryRunner.query(`ALTER TABLE "file_relation" ADD CONSTRAINT "FK_3afe8d597acab450af03ee51133" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_relation" DROP CONSTRAINT "FK_3afe8d597acab450af03ee51133"`);
        await queryRunner.query(`ALTER TABLE "file_relation" DROP COLUMN "team_id"`);
        await queryRunner.query(`CREATE INDEX "user_email_trgm_idx" ON "user" ("email") `);
    }

}
