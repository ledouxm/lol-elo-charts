import { Migration } from '@mikro-orm/migrations';

export class Migration20230415225810 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "summoner" add column "summoner_id" varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "summoner" drop column "summoner_id";');
  }

}
