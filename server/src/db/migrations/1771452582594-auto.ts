import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1771452582594 implements MigrationInterface {
    name = 'Auto1771452582594'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."authorization_provider_type_enum" AS ENUM('LOCAL', 'GOOGLE', 'GITHUB')`);
        await queryRunner.query(`CREATE TABLE "authorization_provider" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "passwordHash" character varying, "providerId" character varying, "type" "public"."authorization_provider_type_enum" NOT NULL, "user_id" uuid, CONSTRAINT "PK_3ad8f4a23fd86d596e9af6556f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a6e55b971f5fa8da9de60635a5" ON "authorization_provider" ("type") `);
        await queryRunner.query(`CREATE TABLE "user_schema" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "avatar_url" character varying NOT NULL DEFAULT 'https://....', "telegram" character varying, "discord" character varying, "first_name" character varying, "last_name" character varying, "sur_name" character varying, "age" integer, "role" character varying NOT NULL DEFAULT 'USER', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3139d290f30a0aa0d583c99a6e1" UNIQUE ("username"), CONSTRAINT "UQ_94e8783d7bec8ea1287c412d0c3" UNIQUE ("email"), CONSTRAINT "PK_a8d4ecce27b86a1bff2ddaf3031" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "authorization_provider" ADD CONSTRAINT "FK_a2e45af8406489ff058f4f83f12" FOREIGN KEY ("user_id") REFERENCES "user_schema"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "authorization_provider" DROP CONSTRAINT "FK_a2e45af8406489ff058f4f83f12"`);
        await queryRunner.query(`DROP TABLE "user_schema"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a6e55b971f5fa8da9de60635a5"`);
        await queryRunner.query(`DROP TABLE "authorization_provider"`);
        await queryRunner.query(`DROP TYPE "public"."authorization_provider_type_enum"`);
    }

}
