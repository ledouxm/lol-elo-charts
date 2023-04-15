import { Migration } from '@mikro-orm/migrations';

export class Migration20230415223513 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "summoner" ("puuid" varchar(255) not null, "current_name" varchar(255) not null, "is_active" boolean not null, "checked_at" timestamptz(0) null, constraint "summoner_pkey" primary key ("puuid"));');

    this.addSql('create table "rank" ("id" serial primary key, "summoner_puuid" varchar(255) not null, "tier" varchar(255) not null, "rank" varchar(255) not null, "league_points" int not null, "created_at" timestamptz(0) not null);');

    this.addSql('alter table "rank" add constraint "rank_summoner_puuid_foreign" foreign key ("summoner_puuid") references "summoner" ("puuid") on update cascade;');
  }

}
