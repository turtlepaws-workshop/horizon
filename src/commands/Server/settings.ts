import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, MessageButton, MessageEmbed, ApplicationCommandAutocompleteOption, AutocompleteInteraction, ApplicationCommandOptionChoice, Channel, Message, TextChannel } from "discord.js";
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

export default class Invite extends Command {
    constructor() {
        super({
            commandBuilder: new SignalSlashCommandBuilder()
                .setName("settings")
                .setDescription("Change the guilds settings."),
            requiredPermissions: [
                "ADMINISTRATOR"
            ],
            runPermissions: [],
            somePermissions: []
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        const customId = (val) => v4() + val;

        const customIds = {
            LvlModal: customId("levelSettingsModal"),
            Fields: {
                message: customId("levelUpMessage"),
                cardBackgroundURL: customId("cardBackgroundURL"),
                cardProgressBar: customId("cardProgressBar"),

            }
        }
        const { Fields } = customIds;
        const LevelModal = new Modal()
        .setTitle(`Settings - Levels`)
        .setCustomId(customIds.LvlModal)
        .addComponents(
            new TextInputComponent()
            .setLabel("Level Message")
            .setCustomId(Fields.message)
            .setDefaultValue(
                `Placeholders: https://go.slashr.xyz/placeholders`
            )
            .setPlaceholder(`GG {{userMention}}. You leveled up to level {{level}}!`)
            .setMaxLength(2000)
            .setMinLength(2)
            .setStyle("LONG"),
            new TextInputComponent()
            .setLabel("Level Card Background URL")
            .setCustomId(Fields.cardBackgroundURL)
            .setDefaultValue(
                `https://turtlepaw.is-from.space/r/rank.png`
            )
            .setPlaceholder(`https://turtlepaw.is-from.space/r/rank.png (use a raw image url)`)
            .setMaxLength(100)
            .setMinLength(7)
            .setStyle("SHORT"),
            new TextInputComponent()
            .setLabel("Level Progress Bar")
            .setCustomId(Fields.cardProgressBar)
            .setPlaceholder(`#5865f2`)
            .setMaxLength(20)
            .setMinLength(4)
            .setStyle("SHORT")
        );

        showModal(LevelModal, {
            interaction, client
        })
    }
}