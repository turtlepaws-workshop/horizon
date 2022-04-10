import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, MessageButton } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun } from "../../util/util";
import Command from "../../lib/command";
import HorizonSlashCommandBuilder from "../../lib/SlashCommandBuilder";
import { generateDashboardURL, website } from "../../config/config";

export default class Invite extends Command {
    constructor(){
        super({
            commandBuilder: new HorizonSlashCommandBuilder()
            .setName("dashboard")
            .setDescription("Get a link to your dashboard."),
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: [],
            dev: true
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        await interaction.reply({
            content: `${client.customEmojis.get("check_")} Here you go!`,
            components: [
                {
                    type: 1,
                    components: [
                        new MessageButton()
                        .setLabel(`Dashboard`)
                        .setURL(generateDashboardURL(interaction.guild.id))
                        .setStyle("LINK")
                    ]
                }
            ]
        });
    }
}