import { Client, Guild, Interaction } from "discord.js";
import { GuildSettings } from "../entities/settings";
import { AppDataSource } from "../sqlite";

export async function fetchSettings(guildId: string) {
    const r = (await AppDataSource).getRepository(GuildSettings);
    const result = await r.findOneBy({
        guildId
    });
    return result;
};

export function fetchSettingsCache(guildId: string, client: Client){
    return client.settingsCache.get(guildId);
}