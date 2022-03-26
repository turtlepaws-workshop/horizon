import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client } from "discord.js";
import { Embed } from "../../util/embed";
import util from "../../util/util";
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
        const permisisonsRequired = util.calculatePermissionForRun(client);
        const botMe = interaction.guild.me;

        await interaction.reply({
            embeds: new Embed()
            .setTitle(`Invite Info`)
            .addField(`🔗 Link`, `[Click Here](${client.generateInvite({
                scopes: ["applications.commands", "bot"],
                permissions: permisisonsRequired,
            })})`)
            .addField(`Bot Permissions`, permisisonsRequired.toArray().map(e => (botMe.permissions.has(e) ? `✅` : `❌`) + codeBlock(e)).join("\n"))
            .build()
        });
    }
}