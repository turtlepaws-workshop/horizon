import { codeBlock } from "@discordjs/builders";
import { ChannelType, Client, Interaction } from "discord.js";
import { hasPermission, hasPermissionByArray, somePermission } from "../util/permissions";
import Event from "../lib/event"
import { ErrorMessage } from "../util/util";
import { get } from "../text/manager";

export default class InteractionCommandEvent extends Event {
    constructor(){
        super({
            event: "interactionCreate"
        });
    }

    async execute(client: Client<boolean>, interaction: Interaction): Promise<void> {
        //Should be isChatInputCommand
        if(!interaction.isChatInputCommand()) return;
        const Command = client.commands.all.find(e => e.name == interaction.commandName);
        if(!Command) return ErrorMessage(`Command not found...`, interaction);
        const channel = interaction.channel;

        await client.uDB.addCommand();

        if(channel == null || channel?.isDMBased()){
            return ErrorMessage(
                await get("ServerOnly", interaction),
                interaction
            );
        }
        

        //@ts-ignore
        if(!(hasPermissionByArray(interaction.member, Command?.requiredPermissions ?? []) || somePermission(interaction.member, Command?.somePermissions ?? []))){
            return ErrorMessage(
                await get("MissingPermissions", interaction),
                interaction
            );
        }

        if(!interaction.guild.members.me.permissions.has(Command.runPermissions)){
            return ErrorMessage(
                await get("BotMissingPermissions", interaction),
                interaction
            );
        }

        if(!client.customEmojisReady){
            return ErrorMessage(
                await get("EmojisCaching", interaction),
                interaction,
                "warning",
                true
            )
        }

        try {
            await Command.execute(interaction, client);
        } catch(e) {
            console.log(e);
            ErrorMessage(
                `${await get("Error", interaction)}\n\n${codeBlock("js", e)}`,
                interaction
            );
        }
    }
}