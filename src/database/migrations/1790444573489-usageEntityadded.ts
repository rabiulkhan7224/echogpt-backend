import { MigrationInterface, QueryRunner } from "typeorm";

export class UsageEntityadded1790444573489 implements MigrationInterface {
    name = 'UsageEntityadded1790444573489'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "api_usage_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "provider_id" uuid, "endpoint" character varying(200) NOT NULL, "method" character varying(10) NOT NULL, "status_code" integer NOT NULL, "latency_ms" integer NOT NULL, "tokens_used" integer, "ip_address" character varying(64), "error_message" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_44911ac00797b4afb1be1cac1a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a65dc3a2233f9a9a5c05fe245d" ON "api_usage_logs"  ("endpoint") `);
        await queryRunner.query(`CREATE INDEX "IDX_7a468e1f171c8cb0d839e54d09" ON "api_usage_logs"  ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_d737efeb438aa89bf5fd0a7086" ON "api_usage_logs"  ("user_id", "created_at") `);
        await queryRunner.query(`ALTER TABLE "api_usage_logs" ADD CONSTRAINT "FK_e60c9fbae8b88e6bf43942ac61e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "api_usage_logs" ADD CONSTRAINT "FK_65b0e36a88ca57923099d2493ee" FOREIGN KEY ("provider_id") REFERENCES "ai_providers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api_usage_logs" DROP CONSTRAINT "FK_65b0e36a88ca57923099d2493ee"`);
        await queryRunner.query(`ALTER TABLE "api_usage_logs" DROP CONSTRAINT "FK_e60c9fbae8b88e6bf43942ac61e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d737efeb438aa89bf5fd0a7086"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7a468e1f171c8cb0d839e54d09"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a65dc3a2233f9a9a5c05fe245d"`);
        await queryRunner.query(`DROP TABLE "api_usage_logs"`);
    }

}
