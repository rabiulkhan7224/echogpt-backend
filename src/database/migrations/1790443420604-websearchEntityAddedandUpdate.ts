import { MigrationInterface, QueryRunner } from "typeorm";

export class WebsearchEntityAddedandUpdate1790443420604 implements MigrationInterface {
    name = 'WebsearchEntityAddedandUpdate1790443420604'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "web_search_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "search_id" uuid NOT NULL, "title" character varying(300) NOT NULL, "url" character varying(1000) NOT NULL, "snippet" text, "position" integer NOT NULL, CONSTRAINT "PK_ee29755a4232e640c8b5f5d2e74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b21fedd569b578e7cc4d863c2d" ON "web_search_results"  ("search_id") `);
        await queryRunner.query(`CREATE TABLE "web_searches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "user_id" uuid NOT NULL, "query" character varying(500) NOT NULL, "result_count" integer NOT NULL DEFAULT '0', "cached" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_dbec663af69a28037f60b34ab63" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1007bb1e747da5acbac81436d1" ON "web_searches"  ("query") `);
        await queryRunner.query(`CREATE INDEX "IDX_c46a1d20703547bdca2d415fc3" ON "web_searches"  ("user_id", "createdAt") `);
        await queryRunner.query(`ALTER TABLE "web_search_results" ADD CONSTRAINT "FK_b21fedd569b578e7cc4d863c2d1" FOREIGN KEY ("search_id") REFERENCES "web_searches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "web_searches" ADD CONSTRAINT "FK_2fb3dc7479b8ded13e49990d0c7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "web_searches" DROP CONSTRAINT "FK_2fb3dc7479b8ded13e49990d0c7"`);
        await queryRunner.query(`ALTER TABLE "web_search_results" DROP CONSTRAINT "FK_b21fedd569b578e7cc4d863c2d1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c46a1d20703547bdca2d415fc3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1007bb1e747da5acbac81436d1"`);
        await queryRunner.query(`DROP TABLE "web_searches"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b21fedd569b578e7cc4d863c2d"`);
        await queryRunner.query(`DROP TABLE "web_search_results"`);
    }

}
