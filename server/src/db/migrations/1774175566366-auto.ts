import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1774175566366 implements MigrationInterface {
    name = 'Auto1774175566366'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "competition" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "description" text, "ultraWideBanner" character varying, "banner" character varying, "avatar" character varying, "socialMedia" character varying, "dateOfStart" TIMESTAMP WITH TIME ZONE, "dateOfEnd" TIMESTAMP WITH TIME ZONE, "dateOfStartRegistration" TIMESTAMP WITH TIME ZONE, "dateOfEndRegistration" TIMESTAMP WITH TIME ZONE, "rules" jsonb NOT NULL DEFAULT '[]', "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a52a6248db574777b226e9445bc" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "competition"`);
    }

}
