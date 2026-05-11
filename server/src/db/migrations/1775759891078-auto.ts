import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1775759891078 implements MigrationInterface {
    name = 'Auto1775759891078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."authorization_provider_type_enum" AS ENUM('LOCAL', 'GOOGLE', 'GITHUB')`);
        await queryRunner.query(`CREATE TABLE "authorization_provider" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."authorization_provider_type_enum" NOT NULL, "passwordHash" character varying, "providerId" character varying, "user_id" uuid, CONSTRAINT "PK_3ad8f4a23fd86d596e9af6556f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "content" character varying NOT NULL, "from" character varying NOT NULL, "toId" uuid, "toEmail" character varying, "status" character varying NOT NULL DEFAULT 'SENDED', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "avatar_url" character varying NOT NULL DEFAULT 'https://....', "telegram" character varying, "discord" character varying, "first_name" character varying, "last_name" character varying, "sur_name" character varying, "birth_day" date, "role" character varying NOT NULL DEFAULT 'USER', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."competition_status" AS ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED', 'REGISTRATION', 'WAITING_FOR_START', 'STARTED', 'SCORING', 'ARCHIVED', 'CANCELED')`);
        await queryRunner.query(`CREATE TABLE "competition" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "description" text, "ultraWideBanner" character varying, "banner" character varying, "avatar" character varying, "socialMedia" character varying, "dateOfStart" TIMESTAMP WITH TIME ZONE, "dateOfEnd" TIMESTAMP WITH TIME ZONE, "dateOfStartRegistration" TIMESTAMP WITH TIME ZONE, "dateOfEndRegistration" TIMESTAMP WITH TIME ZONE, "publishedAt" TIMESTAMP WITH TIME ZONE, "rules" jsonb NOT NULL DEFAULT '[]', "status" "public"."competition_status" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a52a6248db574777b226e9445bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."round_icon_enum" AS ENUM('ERROR', 'WARNING', 'INFO', 'SUCCESS', 'QUESTION', 'EXCLAMATION', 'LOCK', 'UNLOCK', 'PROHIBITED', 'CHECK_CIRCLE', 'EYE', 'EYE_OFF', 'LIST', 'GAVEL', 'FILE_TEXT', 'CLIPBOARD', 'BOOK', 'CLOCK', 'CALENDAR', 'HOURGLASS', 'USERS', 'USER_CHECK', 'MESSAGES', 'SHARE', 'TROPHY', 'STAR', 'GIFT', 'MEDAL', 'CODE', 'CPU', 'GLOBE', 'LIGHTBULB')`);
        await queryRunner.query(`CREATE TYPE "public"."round_status" AS ENUM('CREATED', 'IN_PROGRESS', 'ON_JUDGING', 'FINISHED')`);
        await queryRunner.query(`CREATE TABLE "round" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "hidden" boolean NOT NULL, "description" character varying, "icon" "public"."round_icon_enum" NOT NULL DEFAULT 'CPU', "startOfRound" TIMESTAMP WITH TIME ZONE, "endOfRound" TIMESTAMP WITH TIME ZONE, "status" "public"."round_status" NOT NULL, "competition_id" uuid, CONSTRAINT "PK_34bd959f3f4a90eb86e4ae24d2d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "color" character varying NOT NULL, "roundId" uuid, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "file" ("url" character varying NOT NULL, "mimeType" character varying NOT NULL, "size" integer NOT NULL, "slot" character varying NOT NULL, CONSTRAINT "PK_ff5d246bb5831ad7351f87e67cb" PRIMARY KEY ("url"))`);
        await queryRunner.query(`CREATE TABLE "file_relation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slot" character varying NOT NULL, "user_id" uuid, "competition_id" uuid, "file_url" character varying, CONSTRAINT "PK_0d310c9c9f5eea4263cc8deee4a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "authorization_provider" ADD CONSTRAINT "FK_a2e45af8406489ff058f4f83f12" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_fafec2a7604ef9e0ccc328d7496" FOREIGN KEY ("toId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "round" ADD CONSTRAINT "FK_1bf0da6dee0bece0ec5e93280ba" FOREIGN KEY ("competition_id") REFERENCES "competition"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_279a52187ee0963fb65d9cafd45" FOREIGN KEY ("roundId") REFERENCES "round"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file_relation" ADD CONSTRAINT "FK_f08036056ca7e96e8028b5ac2f8" FOREIGN KEY ("file_url") REFERENCES "file"("url") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file_relation" ADD CONSTRAINT "FK_ebb0baeeabc8f72c742ce0f283e" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file_relation" ADD CONSTRAINT "FK_7ffc961e62f5138dc8f8ab50d69" FOREIGN KEY ("competition_id") REFERENCES "competition"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_relation" DROP CONSTRAINT "FK_7ffc961e62f5138dc8f8ab50d69"`);
        await queryRunner.query(`ALTER TABLE "file_relation" DROP CONSTRAINT "FK_ebb0baeeabc8f72c742ce0f283e"`);
        await queryRunner.query(`ALTER TABLE "file_relation" DROP CONSTRAINT "FK_f08036056ca7e96e8028b5ac2f8"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_279a52187ee0963fb65d9cafd45"`);
        await queryRunner.query(`ALTER TABLE "round" DROP CONSTRAINT "FK_1bf0da6dee0bece0ec5e93280ba"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_fafec2a7604ef9e0ccc328d7496"`);
        await queryRunner.query(`ALTER TABLE "authorization_provider" DROP CONSTRAINT "FK_a2e45af8406489ff058f4f83f12"`);
        await queryRunner.query(`DROP TABLE "file_relation"`);
        await queryRunner.query(`DROP TABLE "file"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`DROP TABLE "round"`);
        await queryRunner.query(`DROP TYPE "public"."round_status"`);
        await queryRunner.query(`DROP TYPE "public"."round_icon_enum"`);
        await queryRunner.query(`DROP TABLE "competition"`);
        await queryRunner.query(`DROP TYPE "public"."competition_status"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TABLE "authorization_provider"`);
        await queryRunner.query(`DROP TYPE "public"."authorization_provider_type_enum"`);
    }

}
