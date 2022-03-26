import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun } from "../../util/util";
import Command from "../../lib/command";

export default class Invite extends Command {
    constructor(){
        super({
            description: `See what permissions the bot is missing.`,
            name: `permissions`,
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: []
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        const permisisonsRequired = calculatePermissionForRun(client);
        const botMe = interaction.guild.me;
        const mappedPermissionsString: string = permisisonsRequired.toArray().map(e => (botMe.permissions.has(e) ? `✅ ` : `❌ `) + codeBlock(e)).join("\n");
        const clientInvite: string = client.generateInvite({
            scopes: ["applications.commands", "bot"],
            permissions: permisisonsRequired
        });

        await interaction.reply({
            embeds: new Embed()
            .setTitle(`Bot Permissions`)
            .addField(`${client.customEmojis.get("invite")} Invite Link`, `[Click Here](${clientInvite})`)
            .addField(`${client.customEmojis.get("secure")} Bot Permissions`, mappedPermissionsString.length <= 0 ? "No permissions missing..." : mappedPermissionsString)
            .build()
        });
    }
}