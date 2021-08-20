import { Migration } from '@mikro-orm/migrations';

export class Migration20210820082601 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "color" varchar(255) null;');
  }

}
