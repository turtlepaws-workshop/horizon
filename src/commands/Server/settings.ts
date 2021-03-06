import { channelMention, codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { ButtonStyle, CommandInteraction, CacheType, Client, ButtonBuilder as MessageButton, EmbedBuilder as MessageEmbed, ApplicationCommandAutocompleteOption, AutocompleteInteraction, Channel, Message, TextChannel, ActionRowBuilder as MessageActionRow } from "discord.js";
import { Embed } from "../../util/embed";
import { actionRow as ActionRow, actionRowJSON, calculatePermissionForRun, ErrorMessage } from "../../util/util";
import Command from "../../lib/command";
import HorizonSlashCommandBuilder from "../../lib/SlashCommandBuilder";
import { Modal, showModal, TextInputComponent } from "discord-modals";
import { v4 } from "uuid";
import EmbedData from "../../models/embed";
import { EmbedModel } from "../../typings/index";
import { website } from "../../config/config";
import { createSettings } from "../../client/levels";
import embed from "../../models/embed";
import { parseStringMap } from "../../lib/stringmap";

export default class Invite extends Command {
    constructor() {
        super({
            commandBuilder: new HorizonSlashCommandBuilder()
                .setName("settings")
                .setDescription("Change the guilds settings."),
            requiredPermissions: [
                "Administrator"
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
            .setStyle(ButtonStyle.Primary)
            .setCustomId(customIds.buttons.Guild),
            Levels: new MessageButton()
            .setLabel("Level Settings")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(customIds.buttons.Levels),
            Moderator: new MessageButton()
            .setLabel("Moderator Settings")
            .setStyle(ButtonStyle.Danger)
            .setCustomId(customIds.buttons.Mod),
            on: () => new MessageButton()
            .setLabel("Set on")
            .setStyle(ButtonStyle.Success)
            .setCustomId(customId(customIds.buttons.on)),
            off: () => new MessageButton()
            .setLabel("Set off")
            .setStyle(ButtonStyle.Danger)
            .setCustomId(customId(customIds.buttons.off))
        };
        const actionRows = {
            main: actionRowJSON(buttons.Server, buttons.Moderator, buttons.Levels),
            offOn: () => actionRowJSON(buttons.on(), buttons.off())
        };

        console.log("adding functions")
        function checkOrXMark(val: boolean){
            return val ? client.customEmojis.get("check_").toString() : client.customEmojis.get("xmark_").toString();
        }
        function embedValue(name: any, value: any, end?: boolean){
            //No channel
            if(value == "<#null>") value = "None";
            //No value
            if(value == "") value = "None";
            return `**${name == null ? "None" : name.toString()}:** ${value == null ? "None" : value.toString()}${!end ? "\n" : ""}`;
        }
        function code(val: any){
            return `\`${val.toString()}\``
        }

        console.log("fetching server settings")
        const currentSettings = await createSettings(interaction.guild.id);

        console.log(currentSettings)
        console.log("editing message")
        const message: Message = await interaction.editReply({
            embeds: new Embed()
            .setTitle(`This server's settings`)
            //.addField(`${client.customEmojis.get("secure")} AutoModerator`, `**Enabled:** ${checkOrXMark(currentSettings.automod_enabled)}\n${embedValue("Banned Words", Array.from(parseStringMap(currentSettings.automod_bannedWords)).map(e => `\`${e}\``).join(", "))}`)
            //.addField(`${client.customEmojis.get("levels")} Levels`, `${embedValue("Enabled", checkOrXMark(currentSettings.levels_enabled))}${embedValue("Embed", checkOrXMark(currentSettings.levels_embed))}${embedValue("Custom Message", currentSettings.levels_message || "Default")}${embedValue("Message Channel", channelMention(currentSettings.levels_messageChannel) || "None")}${embedValue("Card Progress Bar Color", code(currentSettings.levels_cardProgressBar))}${embedValue("Card Background URL", currentSettings.levels_cardBackgroundURL, true)}`)
            //.addField(`${client.customEmojis.get("list")} Server Settings`, `${embedValue("Moderator Commands", currentSettings.guild_modCommands, true)}`)
            .build(),
            components: [
                actionRows.main
            ]
        });

        const collector = await message.createMessageComponentCollector({
            filter: i => i.user.id==interaction.user.id
        });

        collector.on("collect", async i => {
            if(i.customId == customIds.buttons.Guild){
                //Ask if they want it enabled
            } else if(i.customId == customIds.buttons.Levels){
                //Ask if they want it enabled
                //With cancel btn
                //Show settings modal
                //Go back
            } else if(i.customId == customIds.buttons.Mod){
                //Ask if they want it enabled
            }
        });
    }
}