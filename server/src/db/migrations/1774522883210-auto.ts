import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1774522883210 implements MigrationInterface {
    name = 'Auto1774522883210'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "authorization_provider" DROP CONSTRAINT "FK_a2e45af8406489ff058f4f83f12"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a6e55b971f5fa8da9de60635a5"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "age" TO "birth_day"`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "content" character varying NOT NULL, "from" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'SENDED', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "toId" uuid, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."competition_status" AS ENUM('DRAFT', 'PUBLISHED', 'REGISTRATION', 'WAITING_FOR_START', 'STARTED', 'SCORING', 'ARCHIVED', 'CANCELED')`);
        await queryRunner.query(`CREATE TABLE "competition" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "description" text, "ultraWideBanner" character varying, "banner" character varying, "avatar" character varying, "socialMedia" character varying, "dateOfStart" TIMESTAMP WITH TIME ZONE, "dateOfEnd" TIMESTAMP WITH TIME ZONE, "dateOfStartRegistration" TIMESTAMP WITH TIME ZONE, "dateOfEndRegistration" TIMESTAMP WITH TIME ZONE, "rules" jsonb NOT NULL DEFAULT '[]', "status" "public"."competition_status" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a52a6248db574777b226e9445bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."round_icon_enum" AS ENUM('ERROR', 'WARNING', 'INFO', 'SUCCESS', 'QUESTION', 'EXCLAMATION', 'LOCK', 'UNLOCK', 'PROHIBITED', 'CHECK_CIRCLE', 'EYE', 'EYE_OFF', 'LIST', 'GAVEL', 'FILE_TEXT', 'CLIPBOARD', 'BOOK', 'CLOCK', 'CALENDAR', 'HOURGLASS', 'USERS', 'USER_CHECK', 'MESSAGES', 'SHARE', 'TROPHY', 'STAR', 'GIFT', 'MEDAL', 'CODE', 'CPU', 'GLOBE', 'LIGHTBULB')`);
        await queryRunner.query(`CREATE TYPE "public"."round_status" AS ENUM('CREATED', 'IN_PROGRESS', 'ON_JUDGING', 'FINISHED')`);
        await queryRunner.query(`CREATE TABLE "round" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "hidden" boolean NOT NULL, "description" character varying, "icon" "public"."round_icon_enum" NOT NULL DEFAULT 'CPU', "startOfRound" TIMESTAMP WITH TIME ZONE, "endOfRound" TIMESTAMP WITH TIME ZONE, "status" "public"."round_status" NOT NULL, "competition_id" uuid, CONSTRAINT "PK_34bd959f3f4a90eb86e4ae24d2d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "file" ("url" character varying NOT NULL, "mimeType" character varying NOT NULL, "size" integer NOT NULL, CONSTRAINT "PK_ff5d246bb5831ad7351f87e67cb" PRIMARY KEY ("url"))`);
        await queryRunner.query(`CREATE TABLE "file_relation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slot" character varying NOT NULL, "user_id" uuid, "file_url" character varying, CONSTRAINT "PK_0d310c9c9f5eea4263cc8deee4a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "birth_day"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "birth_day" date`);
        await queryRunner.query(`ALTER TABLE "authorization_provider" ADD CONSTRAINT "FK_a2e45af8406489ff058f4f83f12" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_fafec2a7604ef9e0ccc328d7496" FOREIGN KEY ("toId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "round" ADD CONSTRAINT "FK_1bf0da6dee0bece0ec5e93280ba" FOREIGN KEY ("competition_id") REFERENCES "competition"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file_relation" ADD CONSTRAINT "FK_f08036056ca7e96e8028b5ac2f8" FOREIGN KEY ("file_url") REFERENCES "file"("url") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file_relation" ADD CONSTRAINT "FK_ebb0baeeabc8f72c742ce0f283e" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_relation" DROP CONSTRAINT "FK_ebb0baeeabc8f72c742ce0f283e"`);
        await queryRunner.query(`ALTER TABLE "file_relation" DROP CONSTRAINT "FK_f08036056ca7e96e8028b5ac2f8"`);
        await queryRunner.query(`ALTER TABLE "round" DROP CONSTRAINT "FK_1bf0da6dee0bece0ec5e93280ba"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_fafec2a7604ef9e0ccc328d7496"`);
        await queryRunner.query(`ALTER TABLE "authorization_provider" DROP CONSTRAINT "FK_a2e45af8406489ff058f4f83f12"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "birth_day"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "birth_day" integer`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`DROP TABLE "file_relation"`);
        await queryRunner.query(`DROP TABLE "file"`);
        await queryRunner.query(`DROP TABLE "round"`);
        await queryRunner.query(`DROP TYPE "public"."round_status"`);
        await queryRunner.query(`DROP TYPE "public"."round_icon_enum"`);
        await queryRunner.query(`DROP TABLE "competition"`);
        await queryRunner.query(`DROP TYPE "public"."competition_status"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "birth_day" TO "age"`);
        await queryRunner.query(`CREATE INDEX "IDX_a6e55b971f5fa8da9de60635a5" ON "authorization_provider" ("type") `);
        await queryRunner.query(`ALTER TABLE "authorization_provider" ADD CONSTRAINT "FK_a2e45af8406489ff058f4f83f12" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
