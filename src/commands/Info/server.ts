import { codeBlock, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, MessageButton, GuildMember } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun, Timestamp } from "../../util/util";
import Command from "../../lib/command";
import SlashCommandOptionBuilder from "../../lib/optionBuilder";

export default class Invite extends Command {
    constructor(){
        super({
            description: `Get info on the current server.`,
            name: `serverinfo`,
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: [],
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        const guild = await interaction.guild.fetch();
        const channels = guild.channels.cache;
        const owner = await guild.fetchOwner();
        
        await interaction.reply({
            embeds: new Embed()
            .setTitle(`Info on ${guild}`)
            .addField(`${client.customEmojis.get("timer")} Created`, `${Timestamp(guild.createdTimestamp, "NONE")} (${Timestamp(guild.createdTimestamp, "R")})`)
            .addField(`${client.customEmojis.get("tada")} Server Birthday`, `${Timestamp(guild.createdTimestamp, "NONE")}`)
            .addField(`${client.customEmojis.get("secure")} Verification`, `\`${guild.verificationLevel}\``)
            .addField(`${client.customEmojis.get("channel")} Channels`, `${client.customEmojis.get("folder")} ${channels.filter(e => e.type == "GUILD_CATEGORY").size} | ${client.customEmojis.get("speaker")} ${channels.filter(e => e.type == "GUILD_VOICE").size} | ${client.customEmojis.get("channel")} ${channels.filter(e => e.type == "GUILD_TEXT").size}`)
            .addField(`${client.customEmojis.get("members")} Members`, `${client.customEmojis.get("members")} ${guild.memberCount} (Total) | ${client.customEmojis.get("bot")} ${guild.members.cache.filter(e => e.user.bot).size} | ${client.customEmojis.get("human")} ${guild.members.cache.filter(e => !e.user.bot).size}`)
            .addField(`${client.customEmojis.get("owner")} Owner`, `${owner} (\`${owner.id}\`)`)
            .addField(`${client.customEmojis.get("boost_")} Boosts`, `${guild.premiumSubscriptionCount} (\`${guild.premiumTier}\`)`)
            .addField(`${client.customEmojis.get("links")} Vanity URL`, `${guild?.vanityURLCode ? guild.vanityURLCode : "None"}`)
            .addField(`${client.customEmojis.get("settings")} Emojis/Stickers`, `${client.customEmojis.get("sticker")} ${guild.stickers.cache.size} | ${client.customEmojis.get("wumpus")} ${guild.emojis.cache.filter(e => !e.animated).size} (static) | ${client.customEmojis.get("gif")} ${guild.emojis.cache.filter(e => e.animated).size}`)
            .setThumbnail(guild.iconURL())
            .setFooter({
                text: guild.id,
                iconURL: client.customEmojis.get("ID").URL
            })
            .build()
        });
    }
}