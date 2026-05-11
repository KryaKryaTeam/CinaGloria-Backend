import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1778446141341 implements MigrationInterface {
    name = 'Auto1778446141341'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."user_email_trgm_idx"`);
        await queryRunner.query(`CREATE TABLE "leaderboard" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nodes" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_76fd1d52cf44d209920f73f4608" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "score" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "score" integer NOT NULL, "team" character varying NOT NULL, "taskId" uuid, CONSTRAINT "PK_1770f42c61451103f5514134078" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "round-review" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "summary" integer NOT NULL, "description" character varying NOT NULL, "byJury" uuid NOT NULL, "roundId" uuid, CONSTRAINT "PK_3c959ac691450ceb329db2b168e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "submition_schema" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL, "githubURL" character varying NOT NULL, "youtubeURL" character varying NOT NULL, "assignedToJury" uuid, "relatedRoundId" uuid, "reviewId" uuid, CONSTRAINT "PK_41dedbad9c2c77330ee7776e490" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "criteria" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "visibility" boolean NOT NULL, "icon" character varying NOT NULL, "score" integer NOT NULL, CONSTRAINT "PK_91cd5f7ff7be5ade9bca5b98cfb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "round" ADD "taskTimeout" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "round" ALTER COLUMN "startOfRound" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "round" ALTER COLUMN "endOfRound" SET NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."competition_status" RENAME TO "competition_status_old"`);
        await queryRunner.query(`CREATE TYPE "public"."competition_status" AS ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED', 'REGISTRATION', 'WAITING_FOR_START', 'STARTED', 'ARCHIVED', 'CANCELED')`);
        await queryRunner.query(`ALTER TABLE "competition" ALTER COLUMN "status" TYPE "public"."competition_status" USING "status"::"text"::"public"."competition_status"`);
        await queryRunner.query(`DROP TYPE "public"."competition_status_old"`);
        await queryRunner.query(`ALTER TABLE "score" ADD CONSTRAINT "FK_d891ff3886d93f13ef26c21cf10" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "round-review" ADD CONSTRAINT "FK_76fa43a43051a8d9e4ba1e0bd46" FOREIGN KEY ("roundId") REFERENCES "round"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "submition_schema" ADD CONSTRAINT "FK_5cb279d704edab28fcef438684a" FOREIGN KEY ("relatedRoundId") REFERENCES "round"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "submition_schema" ADD CONSTRAINT "FK_e1083913e9212109e70c428d132" FOREIGN KEY ("reviewId") REFERENCES "round-review"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "submition_schema" DROP CONSTRAINT "FK_e1083913e9212109e70c428d132"`);
        await queryRunner.query(`ALTER TABLE "submition_schema" DROP CONSTRAINT "FK_5cb279d704edab28fcef438684a"`);
        await queryRunner.query(`ALTER TABLE "round-review" DROP CONSTRAINT "FK_76fa43a43051a8d9e4ba1e0bd46"`);
        await queryRunner.query(`ALTER TABLE "score" DROP CONSTRAINT "FK_d891ff3886d93f13ef26c21cf10"`);
        await queryRunner.query(`CREATE TYPE "public"."competition_status_old" AS ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED', 'REGISTRATION', 'WAITING_FOR_START', 'STARTED', 'SCORING', 'ARCHIVED', 'CANCELED')`);
        await queryRunner.query(`ALTER TABLE "competition" ALTER COLUMN "status" TYPE "public"."competition_status_old" USING "status"::"text"::"public"."competition_status_old"`);
        await queryRunner.query(`DROP TYPE "public"."competition_status"`);
        await queryRunner.query(`ALTER TYPE "public"."competition_status_old" RENAME TO "competition_status"`);
        await queryRunner.query(`ALTER TABLE "round" ALTER COLUMN "endOfRound" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "round" ALTER COLUMN "startOfRound" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "round" DROP COLUMN "taskTimeout"`);
        await queryRunner.query(`DROP TABLE "criteria"`);
        await queryRunner.query(`DROP TABLE "submition_schema"`);
        await queryRunner.query(`DROP TABLE "round-review"`);
        await queryRunner.query(`DROP TABLE "score"`);
        await queryRunner.query(`DROP TABLE "leaderboard"`);
        await queryRunner.query(`CREATE INDEX "user_email_trgm_idx" ON "user" USING GiST ("email") `);
    }

}
