import { codeBlock } from "@discordjs/builders";
import { ButtonInteraction, Client, Interaction, InteractionType } from "discord.js";
import { DiscordClientEvents } from "../typings";
import Event from "../lib/event"
import { ErrorMessage, isAutocomplete } from "../util/util";
import { GenerateEmbed } from "../config/updates";
import { get } from "../text/manager";

interface ButtonEvent {
    execute: (client: Client<boolean>, interaction: ButtonInteraction) => any;
    buttonId: string;
}

const ButtonEvents: ButtonEvent[] = [{
    //what's new button
    buttonId: "whats_new",
    execute(client, interaction) {
        interaction.reply({
            embeds: GenerateEmbed().build()
        });
    }
}];

export default class ButtonEventManager extends Event {
    constructor() {
        super({
            event: "interactionCreate"
        });
    }

    async execute(client: Client<boolean>, interaction: Interaction): Promise<void> {
        //Should be isChatInputCommand
        if (!interaction.isButton()) return;
        const button = ButtonEvents.find(e => e.buttonId == interaction.customId);
        if (!button) return;

        if (!client.customEmojisReady) {
            return ErrorMessage(
                await get("EmojisCaching", interaction),
                interaction,
                "warning",
                true
            )
        }

        try {
            await button.execute(client, interaction);
        } catch (e) {
            console.log(e);
            ErrorMessage(
                `${await get("Error", interaction)}\n\n${codeBlock("js", e)}`,
                interaction,
                "blob_glitch",
                true
            );
        }
    }
}