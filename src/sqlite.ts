import "reflect-metadata"
import { DataSource } from "typeorm"
import { CustomEmbed } from "./entities/embed"
import { Leaderboards } from "./entities/leaderboards"
import { UserMessages } from "./entities/messages"
import { GuildSettings } from "./entities/settings"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: false,
    entities: [CustomEmbed, Leaderboards, UserMessages, GuildSettings],
    migrations: [],
    subscribers: [],
}).initialize();