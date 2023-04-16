import { Migration } from '@mikro-orm/migrations';

export class Migration20230416090813 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "apex" ("id" varchar(255) not null, "master" int not null, "grandmaster" int not null, "challenger" int not null, "created_at" timestamptz(0) not null, constraint "apex_pkey" primary key ("id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "apex" cascade;');
  }

}
