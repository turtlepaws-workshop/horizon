import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, ButtonBuilder as MessageButton, ButtonStyle } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun } from "../../util/util";
import Command from "../../lib/command";
import HorizonSlashCommandBuilder from "../../lib/SlashCommandBuilder";

export default class Invite extends Command {
    constructor(){
        super({
            commandBuilder: new HorizonSlashCommandBuilder()
            .setName("github")
            .setDescription("View our github!"),
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: []
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        await interaction.reply({
            content: `${client.customEmojis.get("fe_code")} Horizon is a fully open-source Discord bot! You can view our github with the link below.`,
            components: [
                {
                    type: 1,
                    components: [
                        new MessageButton()
                        .setLabel(`Github`)
                        .setURL(`https://github.com/turtlepaws-workshop/horizon`)
                        .setStyle(ButtonStyle.Link)
                    ]
                }
            ]
        });
    }
}