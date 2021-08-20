import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { getRandomString, pick } from "@pastable/core";

@Entity()
export class User {
    @PrimaryKey()
    id: string = "u:" + getRandomString();

    @Property({ unique: true })
    username: string;

    @Property({ hidden: true })
    hash: string;

    @Property({ unique: true })
    email?: string;

    @Property({ hidden: true })
    createdAt = new Date();

    @Property({ type: "array", default: [] })
    roles: Array<UserRole> = [];

    @Property({ nullable: true })
    color?: string;
}

export const formatUser = (user: User) => pick(user, ["id", "username", "email", "roles", "color"]);

export type UserRole = "admin";
