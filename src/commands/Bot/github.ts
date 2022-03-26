import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, MessageButton } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun } from "../../util/util";
import Command from "../../lib/command";

export default class Invite extends Command {
    constructor(){
        super({
            description: `View our github!`,
            name: `github`,
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: []
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        await interaction.reply({
            content: `Signal is a **fully** open-source Discord bot! You can view our github with the link below.`,
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