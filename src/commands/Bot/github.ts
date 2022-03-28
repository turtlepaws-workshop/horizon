import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, MessageButton } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun } from "../../util/util";
import Command from "../../lib/command";
import SignalSlashCommandBuilder from "../../lib/SlashCommandBuilder";

export default class Invite extends Command {
    constructor(){
        super({
            commandBuilder: new SignalSlashCommandBuilder()
            .setName("github")
            .setDescription("View our github!"),
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: []
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        await interaction.reply({
            content: `${client.customEmojis.get("github")} Signal is a fully open-source Discord bot! You can view our github with the link below.`,
            components: [
                {
                    type: 1,
                    components: [
                        new MessageButton()
                        .setLabel(`Github`)
                        .setURL(`https://github.com/Turtlepaw/signal`)
                        .setStyle("LINK")
                    ]
                }
            ]
        });
    }
}