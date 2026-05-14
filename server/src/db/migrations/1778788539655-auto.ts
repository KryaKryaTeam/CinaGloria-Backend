import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1778788539655 implements MigrationInterface {
    name = 'Auto1778788539655'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "round" DROP CONSTRAINT "FK_1bf0da6dee0bece0ec5e93280ba"`);
        await queryRunner.query(`DROP INDEX "public"."user_email_trgm_idx"`);
        await queryRunner.query(`ALTER TABLE "round" RENAME COLUMN "competition_id" TO "competitionId"`);
        await queryRunner.query(`ALTER TABLE "team" ADD "roundId" uuid`);
        await queryRunner.query(`ALTER TABLE "submition_schema" ADD "teamId" uuid`);
        await queryRunner.query(`ALTER TABLE "submition_schema" ADD CONSTRAINT "UQ_0a9f73d9cabd3acafebdf7e58eb" UNIQUE ("teamId")`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_b4228aaaf2df4e7b44f98cbd952" FOREIGN KEY ("roundId") REFERENCES "round"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "submition_schema" ADD CONSTRAINT "FK_0a9f73d9cabd3acafebdf7e58eb" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "round" ADD CONSTRAINT "FK_5c27dca42b21e34d35006861931" FOREIGN KEY ("competitionId") REFERENCES "competition"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "round" DROP CONSTRAINT "FK_5c27dca42b21e34d35006861931"`);
        await queryRunner.query(`ALTER TABLE "submition_schema" DROP CONSTRAINT "FK_0a9f73d9cabd3acafebdf7e58eb"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_b4228aaaf2df4e7b44f98cbd952"`);
        await queryRunner.query(`ALTER TABLE "submition_schema" DROP CONSTRAINT "UQ_0a9f73d9cabd3acafebdf7e58eb"`);
        await queryRunner.query(`ALTER TABLE "submition_schema" DROP COLUMN "teamId"`);
        await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "roundId"`);
        await queryRunner.query(`ALTER TABLE "round" RENAME COLUMN "competitionId" TO "competition_id"`);
        await queryRunner.query(`CREATE INDEX "user_email_trgm_idx" ON "user" ("email") `);
        await queryRunner.query(`ALTER TABLE "round" ADD CONSTRAINT "FK_1bf0da6dee0bece0ec5e93280ba" FOREIGN KEY ("competition_id") REFERENCES "competition"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
