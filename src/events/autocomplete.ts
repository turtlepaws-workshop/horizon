import { codeBlock } from "@discordjs/builders";
import { Client, Interaction } from "discord.js";
import Event from "../lib/event"
import { ErrorMessage } from "../util/util";

export default class InteractionAutocompleteEvent extends Event {
    constructor(){
        super({
            event: "interactionCreate"
        });
    }

    async execute(client: Client<boolean>, interaction: Interaction): Promise<void> {
        if(!interaction.isAutocomplete()) return;
        const Command = client.commands.all.find(e => e.name == interaction.commandName);
        if(!Command) return;

        if(!client.customEmojisReady){
            return;
        }

        try {
            const val = await Command.autocomplete(interaction, client);
        } catch(e) {
            console.log(e);
        }
    }
}