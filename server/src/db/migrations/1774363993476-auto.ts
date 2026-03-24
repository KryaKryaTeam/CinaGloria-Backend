import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1774363993476 implements MigrationInterface {
    name = 'Auto1774363993476'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "competition" ADD "publishAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "competition" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."competition_status" AS ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED', 'REGISTRATION', 'WAITING_FOR_START', 'STARTED', 'SCORING', 'ARCHIVED', 'CANCELED')`);
        await queryRunner.query(`ALTER TABLE "competition" ADD "status" "public"."competition_status" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "competition" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."competition_status"`);
        await queryRunner.query(`ALTER TABLE "competition" ADD "status" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "competition" DROP COLUMN "publishAt"`);
    }

}
