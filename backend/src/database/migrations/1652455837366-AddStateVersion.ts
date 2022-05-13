import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStateVersion1652455837366 implements MigrationInterface {
    name = 'AddStateVersion1652455837366'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exercise_wrapper_entity" ADD "stateVersion" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exercise_wrapper_entity" DROP COLUMN "stateVersion"`);
    }

}
