import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, MessageButton, MessageEmbed, ApplicationCommandAutocompleteOption, AutocompleteInteraction, ApplicationCommandOptionChoice, Channel, Message, TextChannel, GuildMember } from "discord.js";
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
import { generateRankCard } from "../../client/levels";

export default class Invite extends Command {
    constructor() {
        super({
            commandBuilder: new SignalSlashCommandBuilder()
                .setName("rank")
                .setDescription("Get your rank or someone else's rank!")
                .addUserOption(
                    "user",
                    "The user."
                ),
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: []
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        //@ts-expect-error
        const member: GuildMember = interaction.options.getMember("user") || interaction.member
        const rankCard = await generateRankCard(member);

        if(rankCard == false){
            ErrorMessage(
                "You don't have a rank! Keep chatting to earn one.",
                interaction,
                "blob_lurk"
            )
            return;
        }

        await interaction.reply({
            files: [
                rankCard
            ]
        })
    }
}