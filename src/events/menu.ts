import { codeBlock } from "@discordjs/builders";
import { Client, Interaction } from "discord.js";
import Event from "../lib/event"
import { ErrorMessage } from "../util/util";

export default class MenuInteractionEvent extends Event {
    constructor(){
        super({
            event: "interactionCreate"
        });
    }

    async execute(client: Client<boolean>, interaction: Interaction): Promise<void> {
        if(!interaction.isContextMenu()) return;
        const Menu = client.menus.find(e => e.name == interaction.commandName);
        if(!Menu) return ErrorMessage(`Menu not found...`, interaction);

        //@ts-ignore
        if(!(interaction.member.permissions.has(Menu?.requiredPermissions ?? []) || interaction.member.permissions.some(Command?.somePermissions ?? []))){
            return ErrorMessage(
                `Missing permissions!`,
                interaction
            );
        }

        if(!interaction.guild.me.permissions.has(Menu.runPermissions)){
            return ErrorMessage(
                `The bot is missing the required permissions to run this menu... Contact the admins!`,
                interaction
            );
        }

        if(!client.customEmojisReady){
            return ErrorMessage(
                `The bots emojis are caching, please wait...`,
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
                `An unexpected error occurred!\n\n${codeBlock("js", e)}`,
                interaction
            );
        }
    }
}