import { Message } from "discord.js";
import { GSettings } from "../lib/extends";
import { Embed } from "../util/embed";

export async function addAndCheckStarboardMessage(message: Message){
    const settings = await GSettings.fetch(message.guild.id);
    if(message.reactions.cache.size < settings.starboard_threshold) return;
    const channel = message.guild.channels.cache.get(settings.starboard_channel);
    if(!channel.isTextBased()) return;

    channel.send({
        embeds: new Embed()
        .setAuthor({
            name: message.member.nickname || message.author.username,
            iconURL: message.author.displayAvatarURL()
        })
        .build()
    })
}