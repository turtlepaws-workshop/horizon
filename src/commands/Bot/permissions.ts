import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, PermissionString } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun } from "../../util/util";
import Command from "../../lib/command";
import SignalSlashCommandBuilder from "../../lib/SlashCommandBuilder";

export default class Invite extends Command {
    constructor(){
        super({
            commandBuilder: new SignalSlashCommandBuilder()
            .setName("permissions")
            .setDescription("See what permissions the bot is missing."),
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: []
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        const permisisonsRequired = calculatePermissionForRun(client);
        const r_ = client.customEmojis.get("r_");
        const botMe = interaction.guild.me;
        function needsPermission(permission: PermissionString){
            return permisisonsRequired.has(permission);
        }
        const mappedPermissionsString: string = botMe.permissions.toArray().map(e => (botMe.permissions.has(e) ? `${client.customEmojis.get("check_")}${needsPermission(e) ? r_ : ""} ` : `${client.customEmojis.get("xmark_")}${needsPermission(e) ? r_ : ""} `) + `\`${e}\``).join("\n");
        const clientInvite: string = client.generateInvite({
            scopes: ["applications.commands", "bot"],
            permissions: permisisonsRequired
        });

        await interaction.reply({
            embeds: new Embed()
            .setTitle(`Bot Permissions`)
            .setDescription(`${client.customEmojis.get("question_mark")} Required permissions will have a ${client.customEmojis.get("r_")}\n\n` + mappedPermissionsString)
            .build()
        });
    }
}