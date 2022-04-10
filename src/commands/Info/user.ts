import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, MessageButton, GuildMember } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun, Timestamp } from "../../util/util";
import Command from "../../lib/command";
import SlashCommandOptionBuilder from "../../lib/optionBuilder";
import HorizonSlashCommandBuilder from "../../lib/SlashCommandBuilder";

export default class Invite extends Command {
    constructor(){
        super({
            commandBuilder: new HorizonSlashCommandBuilder()
            .setName("userinfo")
            .setDescription("Get info on a specific user or you!")
            .addUserOption("user", "The user you want info on."),
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: [],
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        //@ts-ignore
        const user: GuildMember = interaction.options.getMember("user") || interaction.member;
        const hasBanner = () => {
            try {
                user.user.bannerURL();
                return true;
            } catch {
                return false;
            }
        }
        
        await interaction.reply({
            embeds: new Embed()
            .setTitle(`Info on ${user.user.username}`)
            .addField(`${client.customEmojis.get("timer")} Joined Discord`, `${Timestamp(user.user.createdTimestamp, "NONE")} (${Timestamp(user.user.createdTimestamp, "R")})`)
            .addField(`${client.customEmojis.get("right")} Joined This Server`, `${Timestamp(user.joinedTimestamp, "NONE")} (${Timestamp(user.joinedTimestamp, "R")})`)
            .addField(`${client.customEmojis.get("art")} Role Color`, `\`${user.displayHexColor}\``)
            .addField(`${client.customEmojis.get("secure")} Pending Verification`, `${user.pending ? "✅" : "❌"}`)
            .addField(`${client.customEmojis.get("role")} Roles`, `${user.roles.cache.map(e => `${e}`).join(" ")}`)
            .addField(`${client.customEmojis.get("art")} Accent Color`, `\`${user.user.hexAccentColor || "None"}\``)
            .addField(`${client.customEmojis.get("channel")} Tag`, `\`${user.user.tag}\``)
            .setThumbnail(user.displayAvatarURL())
            .setFooter({
                text: `${user.id}`,
                iconURL: client.customEmojis.get("ID").URL
            })
            .build(),
            components: [
                {
                    type: 1,
                    components: [
                        new MessageButton()
                        .setLabel(`Avatar URL`)
                        .setStyle(`LINK`)
                        .setURL(user.displayAvatarURL()),
                        new MessageButton()
                        .setLabel(`Banner URL${hasBanner() ? "" : " (Disabled)"}`)
                        .setStyle(`LINK`)
                        .setURL(user.displayAvatarURL() || "https://discord.com/404")
                        .setDisabled(!hasBanner())
                    ]
                }
            ]
        });
    }
}