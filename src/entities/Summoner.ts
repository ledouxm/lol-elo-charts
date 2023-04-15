import { Entity, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";

@Entity()
export class Summoner {
    @PrimaryKey()
    puuid: string;

    @Property()
    summonerId: string;

    @Property()
    currentName: string;

    @Property()
    isActive: boolean = true;

    @Property({ nullable: true })
    checkedAt?: Date;

    @OneToMany(() => Rank, (rank) => rank.summoner)
    ranks: Rank[];
}

@Entity()
export class Rank {
    @PrimaryKey()
    id: string = v4();

    @ManyToOne(() => Summoner)
    summoner: Summoner;

    @Property()
    tier: string;

    @Property()
    rank: string;

    @Property()
    leaguePoints: number;

    @Property()
    createdAt: Date = new Date();
}
