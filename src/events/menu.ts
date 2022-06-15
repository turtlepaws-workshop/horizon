import { codeBlock } from "@discordjs/builders";
import { Client, Interaction } from "discord.js";
import { hasPermissionByArray, somePermission } from "../util/permissions";
import Event from "../lib/event"
import { ErrorMessage } from "../util/util";
import { get } from "../text/manager";

export default class MenuInteractionEvent extends Event {
    constructor(){
        super({
            event: "interactionCreate"
        });
    }

    async execute(client: Client<boolean>, interaction: Interaction): Promise<void> {
        if(!interaction.isContextMenuCommand()) return;
        const Menu = client.menus.find(e => e.name == interaction.commandName);
        if(!Menu) return ErrorMessage(`Menu not found...`, interaction);
        const channel = interaction.channel;

        client.uDB.addCommand();

        if(channel == null || channel?.isDMBased()){
            return ErrorMessage(
                await get("ServerOnly", interaction),
                interaction
            );
        }

        //@ts-ignore
        if(!(hasPermissionByArray(interaction.member, Menu?.requiredPermissions ?? []) || somePermission(interaction.member, Command?.somePermissions ?? []))){
            return ErrorMessage(
                await get("MissingPermissions", interaction),
                interaction
            );
        }

        if(!interaction.guild.me.permissions.has(Menu.runPermissions)){
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
            await Menu.execute(interaction, client);
        } catch(e) {
            console.log(e);
            ErrorMessage(
                `${await get("Error", interaction)}\n\n${codeBlock("js", e)}`,
                interaction
            );
        }
    }
}