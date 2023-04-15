import { Migration } from '@mikro-orm/migrations';

export class Migration20230415230214 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "rank" alter column "id" type varchar(255) using ("id"::varchar(255));');
    this.addSql('alter table "rank" alter column "id" drop default;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "rank" alter column "id" type int using ("id"::int);');
    this.addSql('create sequence if not exists "rank_id_seq";');
    this.addSql('select setval(\'rank_id_seq\', (select max("id") from "rank"));');
    this.addSql('alter table "rank" alter column "id" set default nextval(\'rank_id_seq\');');
  }

}
