import { channelMention, codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, MessageButton, MessageEmbed, ApplicationCommandAutocompleteOption, AutocompleteInteraction, ApplicationCommandOptionChoice, Channel, Message, TextChannel, MessageActionRow } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun, ErrorMessage } from "../../util/util";
import Command from "../../lib/command";
import SignalSlashCommandBuilder from "../../lib/SlashCommandBuilder";
import { Modal, showModal, TextInputComponent } from "discord-modals";
import { v4 } from "uuid";
import EmbedData from "../../models/embed";
import { EmbedModel } from "../../typings/index";
import { website } from "../../config/config";
import { APIApplicationCommandAutocompleteResponse, ButtonStyle } from "discord-api-types";
import { createSettings } from "../../client/levels";
import embed from "../../models/embed";

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
        console.log("defer reply")
        await interaction.deferReply();

        const customId = (val) => v4() + val;

        //creating customids
        const customIds = {
            LvlModal: customId("levelSettingsModal"),
            Fields: {
                message: customId("levelUpMessage"),
                cardBackgroundURL: customId("cardBackgroundURL"),
                cardProgressBar: customId("cardProgressBar")
            },
            buttons: {
                Levels: customId("levelSettings"),
                Guild: customId("guildSettings"),
                Mod: customId("moderatorSettings"),
                on: customId("on"),
                off: customId("off")
            }
        }
        const { Fields } = customIds;
        console.log("creating modal")
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
        const buttons = {
            Server: new MessageButton()
            .setLabel("Server Settings")
            .setStyle("PRIMARY")
            .setCustomId(customIds.buttons.Guild),
            Levels: new MessageButton()
            .setLabel("Level Settings")
            .setStyle("SECONDARY")
            .setCustomId(customIds.buttons.Levels),
            Moderator: new MessageButton()
            .setLabel("Moderator Settings")
            .setStyle("DANGER")
            .setCustomId(customIds.buttons.Mod),
            on: () => new MessageButton()
            .setLabel("Set on")
            .setStyle("SUCCESS")
            .setCustomId(customId(customIds.buttons.on)),
            off: () => new MessageButton()
            .setLabel("Set off")
            .setStyle("DANGER")
            .setCustomId(customId(customIds.buttons.off))
        };
        function ActionRow(...buttons: MessageButton[]){
            return new MessageActionRow()
            .addComponents(buttons);
        }
        const actionRows = {
            main: ActionRow(buttons.Server, buttons.Moderator, buttons.Levels),
            offOn: () => ActionRow(buttons.on(), buttons.off())
        };

        console.log("adding functions")
        function checkOrXMark(val: boolean){
            return val ? client.customEmojis.get("check_").toString() : client.customEmojis.get("xmark_").toString();
        }
        function embedValue(name: any, value: any, end?: boolean){
            return `**${name.toString()}:** ${value.toString()}${!end ? "\n" : ""}`;
        }
        function code(val: any){
            return `\`${val.toString()}\``
        }
        console.log("fetching server settings")
        const currentSettings = await createSettings(interaction.guild.id);

        console.log("editing message")
        //@ts-expect-error
        const message: Message = await interaction.editReply({
            embeds: new Embed()
            .setTitle(`This server's settings`)
            .addField(`${client.customEmojis.get("secure")} AutoModerator`, `**Enabled:** ${checkOrXMark(currentSettings.automod.enabled)}\n${Array.from(currentSettings.automod.bannedWords.values()).map(e => `\`${e}\``).join(", ")}`)
            .addField(`${client.customEmojis.get("levels")} Levels`, `${embedValue("Enabled", checkOrXMark(currentSettings.levels.enabled))}${embedValue("Embed", checkOrXMark(currentSettings.levels.embed))}${embedValue("Custom Message", currentSettings.levels.message || "Default")}${embedValue("Message Channel", channelMention(currentSettings.levels.messageChannel))}${embedValue("Card Progress Bar Color", code(currentSettings.levels.cardProgressBar))}${embedValue("Card Background URL", currentSettings.levels.cardBackgroundURL, true)}`)
            .addField(`${client.customEmojis.get("list")} Server Settings`, `${embedValue("Moderator Commands", currentSettings.guild.modCommands, true)}`)
            .build(),
            components: [actionRows.main]
        });
    }
}