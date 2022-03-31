import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, MessageButton, MessageEmbed, ApplicationCommandAutocompleteOption, AutocompleteInteraction, ApplicationCommandOptionChoice, Channel, Message, TextChannel, GuildMember, GuildBasedChannel } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun, ErrorMessage } from "../../util/util";
import Command from "../../lib/command";
import SignalSlashCommandBuilder from "../../lib/SlashCommandBuilder";
import { Modal, showModal, TextInputComponent } from "discord-modals";
import { v4 } from "uuid";
import EmbedData from "../../models/embed";
import { EmbedModel } from "../../typings/index";
import { website } from "../../config/config";
import { APIApplicationCommandAutocompleteResponse } from "discord-api-types";
import { addLeaderboardMessage, generateLeaderboard, generateRankCard } from "../../client/levels";

export default class Invite extends Command {
    constructor() {
        super({
            commandBuilder: new SignalSlashCommandBuilder()
                .setName("leaderboard")
                .setDescription("View the server's leaderboard.")
                .addChannelOption(
                    "channel",
                    "The channel to send it in. (auto-updates)"
                ),
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: []
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        await interaction.deferReply({
            ephemeral: true
        });
        //@ts-expect-error
        const channel: GuildBasedChannel = interaction.options.getChannel("channel");
        const leaderboardAttachment = await generateLeaderboard(interaction.guild);

        if(leaderboardAttachment == false){
            return ErrorMessage(
                "There's no leaderboard for this guild! Start chatting to create one.",
                interaction
            );
        }
        if(channel != null && !channel.isText()){
            return ErrorMessage(
                "The channel you selected is not a text channel...",
                interaction
            );
        }
        //@ts-expect-error
        if(channel != null && !(channel.permissionsFor(interaction.member).has("SEND_MESSAGES") && interaction.member.permissions.has("MANAGE_GUILD"))){
            return ErrorMessage(
                "You don't have permissions to talk in there!",
                interaction
            );
        }

        if(channel != null){
            //@ts-expect-error
            const message = await channel.send({
                embeds: new Embed()
                .setImage("attachment://leaderboard.png")
                .build(),
                files: [
                    leaderboardAttachment
                ]
            });

            await addLeaderboardMessage(message);

            await interaction.editReply({
                content: `Message sent to ${channel}. [Go view](${message.url})`
            });
        } else {
            await interaction.editReply({
                embeds: new Embed()
                .setImage("attachment://leaderboard.png")
                .build(),
                files: [
                    leaderboardAttachment
                ]
            });
        }
    }
}