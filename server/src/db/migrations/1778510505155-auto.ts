import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1778510505155 implements MigrationInterface {
  name = 'Auto1778510505155';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    await queryRunner.query(
      `CREATE TYPE "public"."authorization_provider_type_enum" AS ENUM('LOCAL', 'GOOGLE', 'GITHUB')`,
    );
    await queryRunner.query(
      `CREATE TABLE "authorization_provider" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."authorization_provider_type_enum" NOT NULL, "passwordHash" character varying, "providerId" character varying, "user_id" uuid, CONSTRAINT "PK_3ad8f4a23fd86d596e9af6556f1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "content" character varying NOT NULL, "from" character varying NOT NULL, "toId" uuid, "toEmail" character varying, "status" character varying NOT NULL DEFAULT 'SENDED', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "avatar_url" character varying NOT NULL DEFAULT 'https://....', "telegram" character varying, "discord" character varying, "first_name" character varying, "last_name" character varying, "sur_name" character varying, "birth_day" date, "role" character varying NOT NULL DEFAULT 'USER', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "color" character varying NOT NULL, "roundId" uuid, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "leaderboard" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nodes" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_76fd1d52cf44d209920f73f4608" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "score" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "score" integer NOT NULL, "team" character varying NOT NULL, "taskId" uuid, CONSTRAINT "PK_1770f42c61451103f5514134078" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "round-review" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "summary" integer NOT NULL, "description" character varying NOT NULL, "byJury" uuid NOT NULL, "roundId" uuid, CONSTRAINT "PK_3c959ac691450ceb329db2b168e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "submition_schema" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL, "githubURL" character varying NOT NULL, "youtubeURL" character varying NOT NULL, "assignedToJury" uuid, "relatedRoundId" uuid, "reviewId" uuid, CONSTRAINT "PK_41dedbad9c2c77330ee7776e490" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."round_icon_enum" AS ENUM('ERROR', 'WARNING', 'INFO', 'SUCCESS', 'QUESTION', 'EXCLAMATION', 'LOCK', 'UNLOCK', 'PROHIBITED', 'CHECK_CIRCLE', 'EYE', 'EYE_OFF', 'LIST', 'GAVEL', 'FILE_TEXT', 'CLIPBOARD', 'BOOK', 'CLOCK', 'CALENDAR', 'HOURGLASS', 'USERS', 'USER_CHECK', 'MESSAGES', 'SHARE', 'TROPHY', 'STAR', 'GIFT', 'MEDAL', 'CODE', 'CPU', 'GLOBE', 'LIGHTBULB')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."round_status" AS ENUM('CREATED', 'IN_PROGRESS', 'ON_JUDGING', 'FINISHED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "round" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "hidden" boolean NOT NULL, "description" character varying, "icon" "public"."round_icon_enum" NOT NULL DEFAULT 'CPU', "startOfRound" TIMESTAMP WITH TIME ZONE NOT NULL, "taskTimeout" TIMESTAMP WITH TIME ZONE NOT NULL, "endOfRound" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."round_status" NOT NULL, "competition_id" uuid, CONSTRAINT "PK_34bd959f3f4a90eb86e4ae24d2d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."competition_status" AS ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED', 'REGISTRATION', 'WAITING_FOR_START', 'STARTED', 'ARCHIVED', 'CANCELED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "competition" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "description" text, "ultraWideBanner" character varying, "banner" character varying, "avatar" character varying, "socialMedia" character varying, "dateOfStart" TIMESTAMP WITH TIME ZONE, "dateOfEnd" TIMESTAMP WITH TIME ZONE, "dateOfStartRegistration" TIMESTAMP WITH TIME ZONE, "dateOfEndRegistration" TIMESTAMP WITH TIME ZONE, "publishedAt" TIMESTAMP WITH TIME ZONE, "rules" jsonb NOT NULL DEFAULT '[]', "status" "public"."competition_status" NOT NULL, "settings" jsonb NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a52a6248db574777b226e9445bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."team_status_enum" AS ENUM('IDLE', 'REGISTRATION', 'ACTIVE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "team" ("id" uuid NOT NULL, "name" character varying NOT NULL, "avatar" character varying NOT NULL, "banner" character varying NOT NULL, "captain" character varying NOT NULL, "status" "public"."team_status_enum" NOT NULL DEFAULT 'IDLE', "history" jsonb NOT NULL DEFAULT '[]', "registrationTimeout" TIMESTAMP, "memberInvites" jsonb NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "activeCompetitionId" uuid, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "file" ("url" character varying NOT NULL, "mimeType" character varying NOT NULL, "size" integer NOT NULL, "slot" character varying NOT NULL, CONSTRAINT "PK_ff5d246bb5831ad7351f87e67cb" PRIMARY KEY ("url"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "file_relation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slot" character varying NOT NULL, "user_id" uuid, "competition_id" uuid, "file_url" character varying, CONSTRAINT "PK_0d310c9c9f5eea4263cc8deee4a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "criteria" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "visibility" boolean NOT NULL, "icon" character varying NOT NULL, "score" integer NOT NULL, CONSTRAINT "PK_91cd5f7ff7be5ade9bca5b98cfb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "UserRelTeamMember" ("teamId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_5bb3cf180bea888439e6192fbd2" PRIMARY KEY ("teamId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_297e76ce40c1c3ab6295c7b21d" ON "UserRelTeamMember" ("teamId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a17199cebf5300f890be1c39a5" ON "UserRelTeamMember" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "authorization_provider" ADD CONSTRAINT "FK_a2e45af8406489ff058f4f83f12" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_fafec2a7604ef9e0ccc328d7496" FOREIGN KEY ("toId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_279a52187ee0963fb65d9cafd45" FOREIGN KEY ("roundId") REFERENCES "round"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "score" ADD CONSTRAINT "FK_d891ff3886d93f13ef26c21cf10" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "round-review" ADD CONSTRAINT "FK_76fa43a43051a8d9e4ba1e0bd46" FOREIGN KEY ("roundId") REFERENCES "round"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "submition_schema" ADD CONSTRAINT "FK_5cb279d704edab28fcef438684a" FOREIGN KEY ("relatedRoundId") REFERENCES "round"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "submition_schema" ADD CONSTRAINT "FK_e1083913e9212109e70c428d132" FOREIGN KEY ("reviewId") REFERENCES "round-review"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "round" ADD CONSTRAINT "FK_1bf0da6dee0bece0ec5e93280ba" FOREIGN KEY ("competition_id") REFERENCES "competition"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "FK_f8105ed25dd2cba1d80aabaa4e6" FOREIGN KEY ("activeCompetitionId") REFERENCES "competition"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_relation" ADD CONSTRAINT "FK_f08036056ca7e96e8028b5ac2f8" FOREIGN KEY ("file_url") REFERENCES "file"("url") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_relation" ADD CONSTRAINT "FK_ebb0baeeabc8f72c742ce0f283e" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_relation" ADD CONSTRAINT "FK_7ffc961e62f5138dc8f8ab50d69" FOREIGN KEY ("competition_id") REFERENCES "competition"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserRelTeamMember" ADD CONSTRAINT "FK_297e76ce40c1c3ab6295c7b21d1" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserRelTeamMember" ADD CONSTRAINT "FK_a17199cebf5300f890be1c39a5b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS "user_email_trgm_idx" 
    ON "user" USING gin ("email" gin_trgm_ops)
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "UserRelTeamMember" DROP CONSTRAINT "FK_a17199cebf5300f890be1c39a5b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserRelTeamMember" DROP CONSTRAINT "FK_297e76ce40c1c3ab6295c7b21d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_relation" DROP CONSTRAINT "FK_7ffc961e62f5138dc8f8ab50d69"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_relation" DROP CONSTRAINT "FK_ebb0baeeabc8f72c742ce0f283e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_relation" DROP CONSTRAINT "FK_f08036056ca7e96e8028b5ac2f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team" DROP CONSTRAINT "FK_f8105ed25dd2cba1d80aabaa4e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "round" DROP CONSTRAINT "FK_1bf0da6dee0bece0ec5e93280ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submition_schema" DROP CONSTRAINT "FK_e1083913e9212109e70c428d132"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submition_schema" DROP CONSTRAINT "FK_5cb279d704edab28fcef438684a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "round-review" DROP CONSTRAINT "FK_76fa43a43051a8d9e4ba1e0bd46"`,
    );
    await queryRunner.query(
      `ALTER TABLE "score" DROP CONSTRAINT "FK_d891ff3886d93f13ef26c21cf10"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_279a52187ee0963fb65d9cafd45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_fafec2a7604ef9e0ccc328d7496"`,
    );
    await queryRunner.query(
      `ALTER TABLE "authorization_provider" DROP CONSTRAINT "FK_a2e45af8406489ff058f4f83f12"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a17199cebf5300f890be1c39a5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_297e76ce40c1c3ab6295c7b21d"`,
    );
    await queryRunner.query(`DROP TABLE "UserRelTeamMember"`);
    await queryRunner.query(`DROP TABLE "criteria"`);
    await queryRunner.query(`DROP TABLE "file_relation"`);
    await queryRunner.query(`DROP TABLE "file"`);
    await queryRunner.query(`DROP TABLE "team"`);
    await queryRunner.query(`DROP TYPE "public"."team_status_enum"`);
    await queryRunner.query(`DROP TABLE "competition"`);
    await queryRunner.query(`DROP TYPE "public"."competition_status"`);
    await queryRunner.query(`DROP TABLE "round"`);
    await queryRunner.query(`DROP TYPE "public"."round_status"`);
    await queryRunner.query(`DROP TYPE "public"."round_icon_enum"`);
    await queryRunner.query(`DROP TABLE "submition_schema"`);
    await queryRunner.query(`DROP TABLE "round-review"`);
    await queryRunner.query(`DROP TABLE "score"`);
    await queryRunner.query(`DROP TABLE "leaderboard"`);
    await queryRunner.query(`DROP TABLE "task"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TABLE "authorization_provider"`);
    await queryRunner.query(
      `DROP TYPE "public"."authorization_provider_type_enum"`,
    );
  }
}
