import { Migration } from '@mikro-orm/migrations';

export class Migration20220828133045 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" varchar(255) not null, "username" varchar(255) not null, "hash" varchar(255) not null, "email" varchar(255) null, "created_at" timestamptz(0) not null, "roles" text[] not null default \'{}\', "color" varchar(255) null, constraint "user_pkey" primary key ("id"));');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');
  }

}
