import { Client } from "discord.js";
import { TestGuild } from ".././config/config";

export default async function(client: Client){
    for(const emoji of client.emojis.cache.values()){
        if(emoji.guild.id == TestGuild){
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