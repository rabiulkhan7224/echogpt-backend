import { MigrationInterface, QueryRunner } from "typeorm";

export class ProviderUpdate1790524830573 implements MigrationInterface {
    name = 'ProviderUpdate1790524830573'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."ai_providers_type_enum" ADD VALUE 'OPENROUTER'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ai_providers_type_enum_old" AS ENUM('OPENAI', 'CLAUDE', 'GEMINI')`);
        await queryRunner.query(`ALTER TABLE "ai_providers" ALTER COLUMN "type" TYPE "public"."ai_providers_type_enum_old" USING "type"::"text"::"public"."ai_providers_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."ai_providers_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."ai_providers_type_enum_old" RENAME TO "ai_providers_type_enum"`);
    }

}
