import { codeBlock, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, ButtonBuilder as MessageButton, GuildMember, ButtonStyle, ChannelType } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun, Timestamp } from "../../util/util";
import Command from "../../lib/command";
import SlashCommandOptionBuilder from "../../lib/optionBuilder";
import HorizonSlashCommandBuilder from "../../lib/SlashCommandBuilder";

export default class ServerInfo extends Command {
    constructor(){
        super({
            commandBuilder: new HorizonSlashCommandBuilder()
            .setName("serverinfo")
            .setDescription("Get info about the current server."),
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: [],
            category: "Info"
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        const guild = await interaction.guild.fetch();
        const channels = guild.channels.cache;
        const owner = await guild.fetchOwner();
        function hasBanner(){
            return guild.banner != null;
        }
        
        await interaction.reply({
            embeds: new Embed()
            .setTitle(`Info on ${guild}`)
            .addField(`${client.customEmojis.get("fe_clock")} Created`, `${Timestamp(guild.createdTimestamp, "NONE")} (${Timestamp(guild.createdTimestamp, "R")})`)
            .addField(`${client.customEmojis.get("fe_created")} Server Birthday`, `${Timestamp(guild.createdTimestamp, "NONE")}`)
            .addField(`${client.customEmojis.get("fe_verification")} Verification`, `\`${guild.verificationLevel}\``)
            .addField(`${client.customEmojis.get("fe_channel")} Channels`, `${client.customEmojis.get("fe_folder")} ${channels.filter(e => e.type == ChannelType.GuildCategory).size} | ${client.customEmojis.get("fe_voice")} ${channels.filter(e => e.type == ChannelType.GuildVoice).size} | ${client.customEmojis.get("fe_channel")} ${channels.filter(e => e.type == ChannelType.GuildText).size}`)
            .addField(`${client.customEmojis.get("fe_people")} Members`, `${client.customEmojis.get("fe_people")} ${guild.memberCount} (Total) | ${client.customEmojis.get("fe_bot")} ${guild.members.cache.filter(e => e.user.bot).size} | ${client.customEmojis.get("fe_user")} ${guild.members.cache.filter(e => !e.user.bot).size}`)
            .addField(`${client.customEmojis.get("fe_user")} Owner`, `${owner} (\`${owner.id}\`)`)
            .addField(`${client.customEmojis.get("fe_upgrade")} Boosts`, `${guild.premiumSubscriptionCount} (\`${guild.premiumTier}\`)`)
            .addField(`${client.customEmojis.get("te_link")} Vanity URL`, `${guild?.vanityURLCode ? guild.vanityURLCode : "None"}`)
            .addField(`${client.customEmojis.get("fe_gear")} Emojis/Stickers`, `${client.customEmojis.get("fe_sticker")} ${guild.stickers.cache.size} | ${client.customEmojis.get("fe_emoji")} ${guild.emojis.cache.filter(e => !e.animated).size} (static) | ${client.customEmojis.get("fe_gif")} ${guild.emojis.cache.filter(e => e.animated).size}`)
            .setThumbnail(guild.iconURL())
            .setFooter({
                text: guild.id,
                iconURL: client.customEmojis.get("ID").URL
            })
            .build(),
            components: [
                {
                    type: 1,
                    components: [
                        new MessageButton()
                        .setLabel(`Icon`)
                        .setURL(guild.iconURL())
                        .setStyle(ButtonStyle.Link),
                        new MessageButton()
                        .setLabel(`Banner${hasBanner() ? "" : " (Disabled)"}`)
                        .setDisabled(!hasBanner())
                        .setURL(hasBanner() ? guild.bannerURL() : "https://discord.com/404")
                        .setStyle(ButtonStyle.Link),
                        new MessageButton()
                        .setLabel("Add birthday as event")
                        .setCustomId("ADD_BIRTHDAY")
                        .setStyle(ButtonStyle.Success)
                    ]
                }
            ]
        });
    }
}