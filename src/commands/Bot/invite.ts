import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client } from "discord.js";
import Command from "../../lib/command";

export default class Invite extends Command {
    constructor(){
        super({
            description: `Invite Signal to your server!`,
            name: `invite`,
            requiredPermissions: [],
            runPermissions: [],
            dev: true
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        await interaction.reply({

        });
    }
}