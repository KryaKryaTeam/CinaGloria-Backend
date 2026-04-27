import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1777061498648 implements MigrationInterface {
  name = 'Auto1777061498648';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."team_status_enum" AS ENUM('IDLE', 'REGISTRATION', 'ACTIVE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "team" ("id" uuid NOT NULL, "name" character varying NOT NULL, "avatar" character varying NOT NULL, "banner" character varying NOT NULL, "captain" character varying NOT NULL, "status" "public"."team_status_enum" NOT NULL DEFAULT 'IDLE', "history" jsonb NOT NULL DEFAULT '[]', "registrationTimeout" TIMESTAMP, "memberInvites" jsonb NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "activeCompetitionId" uuid, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`,
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
      `ALTER TABLE "team" ADD CONSTRAINT "FK_f8105ed25dd2cba1d80aabaa4e6" FOREIGN KEY ("activeCompetitionId") REFERENCES "competition"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserRelTeamMember" ADD CONSTRAINT "FK_297e76ce40c1c3ab6295c7b21d1" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserRelTeamMember" ADD CONSTRAINT "FK_a17199cebf5300f890be1c39a5b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "UserRelTeamMember" DROP CONSTRAINT "FK_a17199cebf5300f890be1c39a5b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserRelTeamMember" DROP CONSTRAINT "FK_297e76ce40c1c3ab6295c7b21d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team" DROP CONSTRAINT "FK_f8105ed25dd2cba1d80aabaa4e6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a17199cebf5300f890be1c39a5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_297e76ce40c1c3ab6295c7b21d"`,
    );
    await queryRunner.query(`DROP TABLE "UserRelTeamMember"`);
    await queryRunner.query(`DROP TABLE "team"`);
    await queryRunner.query(`DROP TYPE "public"."team_status_enum"`);
  }
}
