import { codeBlock, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, MessageButton, GuildMember } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun, Timestamp } from "../../util/util";
import Command from "../../lib/command";
import SlashCommandOptionBuilder from "../../lib/optionBuilder";

export default class Invite extends Command {
    constructor(){
        super({
            description: `Get info on a user in this server.`,
            name: `userinfo`,
            requiredPermissions: [],
            runPermissions: [],
            dev: true,
            somePermissions: [],
        }, new SlashCommandOptionBuilder()
            .addUserOption(
                `user`,
                `The user you want info on.`
            )
        );
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        //@ts-ignore
        const user: GuildMember = interaction.options.getMember("user") || interaction.member;
        
        await interaction.reply({
            embeds: new Embed()
            .setTitle(`Info on ${user.user.username}`)
            .addField(`${client.customEmojis.get("timer")} Joined Discord`, `${Timestamp(user.user.createdTimestamp, "NONE")} (${Timestamp(user.user.createdTimestamp, "R")})`)
            .addField(`${client.customEmojis.get("right")} Joined This Server`, `${Timestamp(user.joinedTimestamp, "NONE")} (${Timestamp(user.joinedTimestamp, "R")})`)
            .build(),
            components: [
                {
                    type: 1,
                    components: [
                        new MessageButton()
                        .setLabel(`Avatar URL`)
                        .setStyle(`LINK`)
                        .setURL(user.displayAvatarURL())
                    ]
                }
            ]
        });
    }
}