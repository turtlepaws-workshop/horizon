import { Client, Collection, Guild } from "discord.js";
import { AppDataSource } from "../sqlite";
import { Repository } from "typeorm";
import { GuildSettings } from "../entities/settings";

export class GuildSettingsCache {
    public client: Client;
    public cache: Collection<string, GuildSettings>;
    public repository: Repository<GuildSettings>;

    constructor(client: Client){
        this.client = client;

        this.cache = new Collection();
    }

    async init(){
        this.repository = (await AppDataSource).getRepository(GuildSettings);
        const results = await this.repository.find();

        for(const res of results){
            this.cache.set(res.guildId, res);
        }

        return this.cache;
    }
}

export function hasLevels(guild: Guild){
    const cache = guild.client.settingsCache;
    const guildCache = cache.get(guild.id);

    return guildCache?.levels_enabled || false;
}