import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, ButtonBuilder as MessageButton, EmbedBuilder as MessageEmbed, ApplicationCommandAutocompleteOption, AutocompleteInteraction, Channel, Message, TextChannel } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun, ErrorMessage } from "../../util/util";
import Command from "../../lib/command";
import HorizonSlashCommandBuilder from "../../lib/SlashCommandBuilder";
import { Modal, showModal, TextInputComponent } from "discord-modals";
import { v4 } from "uuid";
import EmbedData from "../../models/embed";
import { EmbedModel } from "../../typings/index";
import { website } from "../../config/config";

export default class Invite extends Command {
    constructor() {
        super({
            commandBuilder: new HorizonSlashCommandBuilder()
                .setName("webhook")
                .setDescription("Create a webhook in the current channel."),
            requiredPermissions: [
                "ManageWebhooks"
            ],
            runPermissions: [
                "ManageWebhooks"
            ],
            somePermissions: []
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        //@ts-ignore
        const channel: TextChannel = interaction.channel;

        const webhook = await channel.createWebhook("Captain hook", {
            reason: `Created by ${interaction.user.tag}`
        });

        await interaction.reply({
            ephemeral: true,
            embeds: new Embed()
            .setTitle(`${client.customEmojis.get("check_")} Webhook Created`)
            .setDescription(`An application webhook has been created! You can use this webhook to create an embed.`)
            .addField(`${client.customEmojis.get("links")} Webhook URL`, `\`${webhook.url}\``)
            .build()
        })
    }
}