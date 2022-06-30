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

export function fetchSettingsCache(guildId: string, client: Client) {
    return client.settingsCache.get(guildId);
}

export class GSettings {
    static async fetch(guildId: string) {
        return await fetchSettings(guildId);
    }

    static async set(guildId: string, setting: string) {
        const r = (await AppDataSource).getRepository(GuildSettings);
        const result = await r.findOneBy({
            guildId
        });
        if (result) {
            result[setting] = true;
            return await r.save(result);
        }
        return result;
    }

    static async massEdit(guildId: string, settings: GuildSettings) {
        const r = (await AppDataSource).getRepository(GuildSettings);
        let result = await r.findOneBy({
            guildId
        });
        if (result) {
            result = {
                ...settings,
                ...result
            };

            return await r.save(result);
        }
        return result;
    }

    static async reset(guildId: string) {
        const r = (await AppDataSource).getRepository(GuildSettings);
        const result = await r.delete({
            guildId
        });
        return;
    }
}