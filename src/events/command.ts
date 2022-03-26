import { Client, Interaction } from "discord.js";
import Event from "../lib/event"

export default class InteractionCommandEvent extends Event {
    constructor(){
        super({
            event: "interactionCreate"
        });
    }

    async execute(client: Client<boolean>, interaction: Interaction): Promise<void> {
        if(!interaction.isCommand()) return;
        const Command = client.commands.all.find(e => e.name == interaction.commandName);
        if(!Command) return //ErrorMessage();

        client.commands.all 
    }
}