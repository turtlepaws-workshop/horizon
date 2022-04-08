import "reflect-metadata"
import { DataSource } from "typeorm"
import { CustomEmbed } from "./entities/embed"
import { Leaderboards } from "./entities/leaderboards"
import { User } from "./entities/user"
import { GuildSettings } from "./entities/settings"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: false,
    entities: [CustomEmbed, Leaderboards, User, GuildSettings],
    migrations: [],
    subscribers: [],
}).initialize();