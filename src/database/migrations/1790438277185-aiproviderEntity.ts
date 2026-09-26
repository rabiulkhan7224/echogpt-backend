import { MigrationInterface, QueryRunner } from "typeorm";

export class AiproviderEntity1790438277185 implements MigrationInterface {
    name = 'AiproviderEntity1790438277185'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ai_providers_type_enum" AS ENUM('OPENAI', 'CLAUDE', 'GEMINI')`);
        await queryRunner.query(`CREATE TABLE "ai_providers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "user_id" uuid, "type" "public"."ai_providers_type_enum" NOT NULL, "name" character varying(120) NOT NULL, "base_url" character varying(500), "default_model" character varying(120) NOT NULL, "api_key_encrypted" text NOT NULL, "api_key_iv" character varying(64) NOT NULL, "api_key_tag" character varying(64) NOT NULL, "is_enabled" boolean NOT NULL DEFAULT true, "is_default" boolean NOT NULL DEFAULT false, "last_healthy_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_de28ebefc0fb425c37b27a4c0a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_091ca7d62564f5ff1839b40546" ON "ai_providers"  ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_d4e39a43c09296147dd48a4104" ON "ai_providers"  ("user_id") `);
        await queryRunner.query(`ALTER TABLE "ai_providers" ADD CONSTRAINT "FK_d4e39a43c09296147dd48a41041" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_providers" DROP CONSTRAINT "FK_d4e39a43c09296147dd48a41041"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d4e39a43c09296147dd48a4104"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_091ca7d62564f5ff1839b40546"`);
        await queryRunner.query(`DROP TABLE "ai_providers"`);
        await queryRunner.query(`DROP TYPE "public"."ai_providers_type_enum"`);
    }

}
