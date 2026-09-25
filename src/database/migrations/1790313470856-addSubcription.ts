import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubcription1790313470856 implements MigrationInterface {
    name = 'AddSubcription1790313470856'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."plans_name_enum" AS ENUM('FREE', 'PREMIUM')`);
        await queryRunner.query(`CREATE TABLE "plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" "public"."plans_name_enum" NOT NULL, "price_monthly" numeric(10,2) NOT NULL, "request_limit" integer NOT NULL, "search_limit" integer NOT NULL, "provider_limit" integer NOT NULL, "features" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "UQ_253d25dae4c94ee913bc5ec4850" UNIQUE ("name"), CONSTRAINT "PK_3720521a81c7c24fe9b7202ba61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_status_enum" AS ENUM('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE')`);
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "user_id" uuid NOT NULL, "plan_id" uuid NOT NULL, "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'ACTIVE', "requests_used" integer NOT NULL DEFAULT '0', "searches_used" integer NOT NULL DEFAULT '0', "current_period_start" TIMESTAMP WITH TIME ZONE NOT NULL, "current_period_end" TIMESTAMP WITH TIME ZONE NOT NULL, "cancelled_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "REL_d0a95ef8a28188364c546eb65c" UNIQUE ("user_id"), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6ccf973355b70645eff37774de" ON "subscriptions"  ("status") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d0a95ef8a28188364c546eb65c" ON "subscriptions"  ("user_id") `);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d0a95ef8a28188364c546eb65c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6ccf973355b70645eff37774de"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_status_enum"`);
        await queryRunner.query(`DROP TABLE "plans"`);
        await queryRunner.query(`DROP TYPE "public"."plans_name_enum"`);
    }

}
