import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, ButtonBuilder as MessageButton, ButtonStyle } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun } from "../../util/util";
import Command from "../../lib/command";
import HorizonSlashCommandBuilder from "../../lib/SlashCommandBuilder";
import { generateDashboardURL, website } from "../../config/config";

export default class Dashboard extends Command {
    constructor(){
        super({
            commandBuilder: new HorizonSlashCommandBuilder()
            .setName("dashboard")
            .setDescription("Get a link to your dashboard."),
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: [],
            category: "Bot"
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        await interaction.reply({
            content: `${client.customEmojis.get("fe_gear")} Here you go!`,
            components: [
                {
                    type: 1,
                    components: [
                        new MessageButton()
                        .setLabel(`Go to your dashboard`)
                        .setURL(generateDashboardURL(interaction.guild.id))
                        .setStyle(ButtonStyle.Link)
                    ]
                }
            ]
        });
    }
}