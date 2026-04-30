import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1777378847432 implements MigrationInterface {
    name = 'Auto1777378847432'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "round" ADD "taskTimeout" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "round" ALTER COLUMN "startOfRound" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "round" ALTER COLUMN "endOfRound" SET NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."competition_status" RENAME TO "competition_status_old"`);
        await queryRunner.query(`CREATE TYPE "public"."competition_status" AS ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED', 'REGISTRATION', 'WAITING_FOR_START', 'STARTED', 'ARCHIVED', 'CANCELED')`);
        await queryRunner.query(`ALTER TABLE "competition" ALTER COLUMN "status" TYPE "public"."competition_status" USING "status"::"text"::"public"."competition_status"`);
        await queryRunner.query(`DROP TYPE "public"."competition_status_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."competition_status_old" AS ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED', 'REGISTRATION', 'WAITING_FOR_START', 'STARTED', 'SCORING', 'ARCHIVED', 'CANCELED')`);
        await queryRunner.query(`ALTER TABLE "competition" ALTER COLUMN "status" TYPE "public"."competition_status_old" USING "status"::"text"::"public"."competition_status_old"`);
        await queryRunner.query(`DROP TYPE "public"."competition_status"`);
        await queryRunner.query(`ALTER TYPE "public"."competition_status_old" RENAME TO "competition_status"`);
        await queryRunner.query(`ALTER TABLE "round" ALTER COLUMN "endOfRound" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "round" ALTER COLUMN "startOfRound" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "round" DROP COLUMN "taskTimeout"`);
    }

}
