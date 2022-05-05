import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, ApplicationCommandAutocompleteOption, AutocompleteInteraction, Channel, Message, TextChannel, GuildMember } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun, ErrorMessage } from "../../util/util";
import Command from "../../lib/command";
import HorizonSlashCommandBuilder from "../../lib/SlashCommandBuilder";
import { Modal, showModal, TextInputComponent } from "discord-modals";
import { v4 } from "uuid";
import EmbedData from "../../models/embed";
import { EmbedModel } from "../../typings/index";
import { website } from "../../config/config";
import { generateRankCard } from "../../client/levels";
import { hasLevels } from "../../client/settings";

export default class Invite extends Command {
    constructor() {
        super({
            commandBuilder: new HorizonSlashCommandBuilder()
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
        if(!hasLevels(interaction.guild)){
            return ErrorMessage(
                "This guild does not have levels enabled.",
                interaction,
                "blob_think"
            );
        }
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