import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1774548093077 implements MigrationInterface {
    name = 'Auto1774548093077'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "competition" RENAME COLUMN "publishAt" TO "publishedAt"`);
        await queryRunner.query(`CREATE TYPE "public"."round_icon_enum" AS ENUM('ERROR', 'WARNING', 'INFO', 'SUCCESS', 'QUESTION', 'EXCLAMATION', 'LOCK', 'UNLOCK', 'PROHIBITED', 'CHECK_CIRCLE', 'EYE', 'EYE_OFF', 'LIST', 'GAVEL', 'FILE_TEXT', 'CLIPBOARD', 'BOOK', 'CLOCK', 'CALENDAR', 'HOURGLASS', 'USERS', 'USER_CHECK', 'MESSAGES', 'SHARE', 'TROPHY', 'STAR', 'GIFT', 'MEDAL', 'CODE', 'CPU', 'GLOBE', 'LIGHTBULB')`);
        await queryRunner.query(`CREATE TYPE "public"."round_status" AS ENUM('CREATED', 'IN_PROGRESS', 'ON_JUDGING', 'FINISHED')`);
        await queryRunner.query(`CREATE TABLE "round" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "hidden" boolean NOT NULL, "description" character varying, "icon" "public"."round_icon_enum" NOT NULL DEFAULT 'CPU', "startOfRound" TIMESTAMP WITH TIME ZONE, "endOfRound" TIMESTAMP WITH TIME ZONE, "status" "public"."round_status" NOT NULL, "competition_id" uuid, CONSTRAINT "PK_34bd959f3f4a90eb86e4ae24d2d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "color" character varying NOT NULL, "roundId" uuid, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "authorization_provider" ADD CONSTRAINT "FK_a2e45af8406489ff058f4f83f12" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_fafec2a7604ef9e0ccc328d7496" FOREIGN KEY ("toId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "round" ADD CONSTRAINT "FK_1bf0da6dee0bece0ec5e93280ba" FOREIGN KEY ("competition_id") REFERENCES "competition"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_279a52187ee0963fb65d9cafd45" FOREIGN KEY ("roundId") REFERENCES "round"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file_relation" ADD CONSTRAINT "FK_f08036056ca7e96e8028b5ac2f8" FOREIGN KEY ("file_url") REFERENCES "file"("url") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file_relation" ADD CONSTRAINT "FK_ebb0baeeabc8f72c742ce0f283e" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_relation" DROP CONSTRAINT "FK_ebb0baeeabc8f72c742ce0f283e"`);
        await queryRunner.query(`ALTER TABLE "file_relation" DROP CONSTRAINT "FK_f08036056ca7e96e8028b5ac2f8"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_279a52187ee0963fb65d9cafd45"`);
        await queryRunner.query(`ALTER TABLE "round" DROP CONSTRAINT "FK_1bf0da6dee0bece0ec5e93280ba"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_fafec2a7604ef9e0ccc328d7496"`);
        await queryRunner.query(`ALTER TABLE "authorization_provider" DROP CONSTRAINT "FK_a2e45af8406489ff058f4f83f12"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`DROP TABLE "round"`);
        await queryRunner.query(`DROP TYPE "public"."round_status"`);
        await queryRunner.query(`DROP TYPE "public"."round_icon_enum"`);
        await queryRunner.query(`ALTER TABLE "competition" RENAME COLUMN "publishedAt" TO "publishAt"`);
    }

}
