import { codeBlock } from "@discordjs/builders";
import { Client, Interaction } from "discord.js";
import Event from "../lib/event"
import { ErrorMessage } from "../util/util";

export default class InteractionCommandEvent extends Event {
    constructor(){
        super({
            event: "interactionCreate"
        });
    }

    async execute(client: Client<boolean>, interaction: Interaction): Promise<void> {
        if(!interaction.isCommand()) return;
        const Command = client.commands.all.find(e => e.name == interaction.commandName);
        if(!Command) return ErrorMessage(`Command not found...`, interaction);

        //@ts-ignore
        if(!(interaction.member.permissions.has(Command?.requiredPermissions ?? []) || interaction.member.permissions.some(Command?.somePermissions ?? []))){
            return ErrorMessage(
                `Missing permissions!`,
                interaction
            );
        }

        if(!interaction.guild.me.permissions.has(Command.runPermissions)){
            return ErrorMessage(
                `The bot is missing the required permissions to run this command... Contact the admins!`,
                interaction
            );
        }

        if(!client.customEmojisReady){
            return ErrorMessage(
                `The bots emojis are caching, please wait...`,
                interaction,
                true
            )
        }

        try {
            await Command.execute(interaction, client);
        } catch(e) {
            console.log(e);
            ErrorMessage(
                `An unexpected error occurred!\n\n${codeBlock("js", e)}`,
                interaction
            );
        }
    }
}