import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, PermissionsString as PermissionString, OAuth2Scopes } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun } from "../../util/util";
import Command from "../../lib/command";
import HorizonSlashCommandBuilder from "../../lib/SlashCommandBuilder";

export default class Invite extends Command {
    constructor(){
        super({
            commandBuilder: new HorizonSlashCommandBuilder()
            .setName("permissions")
            .setDescription("See what permissions the bot is missing."),
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: []
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        const permisisonsRequired = calculatePermissionForRun(client);
        const r_ = client.customEmojis.get("fe_warning");
        const botMe = interaction.guild.me;
        function needsPermission(permission: PermissionString){
            return permisisonsRequired.has(permission);
        }
        const mappedPermissionsString: string = botMe.permissions.toArray().map(e => (botMe.permissions.has(e) ? `${client.customEmojis.get("fe_checked")}${needsPermission(e) ? r_ : ""} ` : `${client.customEmojis.get("fe_unchecked")}${needsPermission(e) ? r_ : ""} `) + `\`${e}\``).join("\n");
        const clientInvite: string = client.generateInvite({
            scopes: [OAuth2Scopes.ApplicationsCommands, OAuth2Scopes.Bot],
            permissions: permisisonsRequired
        });

        await interaction.reply({
            embeds: new Embed()
            .setTitle(`Bot Permissions`)
            .setDescription(`${client.customEmojis.get("fe_quotes")} Required permissions will have a ${client.customEmojis.get("fe_warning")}\n\n` + mappedPermissionsString)
            .build()
        });
    }
}