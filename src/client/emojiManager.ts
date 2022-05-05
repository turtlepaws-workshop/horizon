import { Client } from "discord.js";
import { TestGuild } from "../config/config";
const emojiGuilds: string[] = ["967466991206158336", "957390803829944391", "958936745628540958", TestGuild, "971588233546850314"]

export default async function(client: Client){
    for(const emoji of client.emojis.cache.values()){
        if(emojiGuilds.includes(emoji.guild.id)){
            client.customEmojis.set(emoji.name, {
                Discordjs: emoji,
                Id: emoji.id,
                URL: emoji.url,
                name: emoji.name,
                toString: () => `${emoji}`
            });
        }
    }
}