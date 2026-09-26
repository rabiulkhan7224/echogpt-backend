import { MigrationInterface, QueryRunner } from "typeorm";

export class AiproviderEntityUpadateAnduser1790441551858 implements MigrationInterface {
    name = 'AiproviderEntityUpadateAnduser1790441551858'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chat_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "user_id" uuid NOT NULL, "title" character varying(200) NOT NULL DEFAULT 'New Chat', "provider_id" uuid, CONSTRAINT "PK_efc151a4aafa9a28b73dedc485f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4d8f43432449e9e7a594efb1f5" ON "chat_sessions"  ("user_id", "updatedAt") `);
        await queryRunner.query(`CREATE TYPE "public"."chat_messages_role_enum" AS ENUM('USER', 'ASSISTANT', 'SYSTEM')`);
        await queryRunner.query(`CREATE TABLE "chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "session_id" uuid NOT NULL, "provider_id" uuid, "role" "public"."chat_messages_role_enum" NOT NULL, "content" text NOT NULL, "tokens_prompt" integer, "tokens_output" integer, "latency_ms" integer, CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_efbcf04c5086fabd02d6a0fb92" ON "chat_messages"  ("session_id", "createdAt") `);
        await queryRunner.query(`ALTER TABLE "chat_sessions" ADD CONSTRAINT "FK_1fa209cf48ae975a109366542a5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_0672782561e44d43febcfba2984" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_f35c750272fb5c4f399891b02f3" FOREIGN KEY ("provider_id") REFERENCES "ai_providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_f35c750272fb5c4f399891b02f3"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_0672782561e44d43febcfba2984"`);
        await queryRunner.query(`ALTER TABLE "chat_sessions" DROP CONSTRAINT "FK_1fa209cf48ae975a109366542a5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_efbcf04c5086fabd02d6a0fb92"`);
        await queryRunner.query(`DROP TABLE "chat_messages"`);
        await queryRunner.query(`DROP TYPE "public"."chat_messages_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4d8f43432449e9e7a594efb1f5"`);
        await queryRunner.query(`DROP TABLE "chat_sessions"`);
    }

}
