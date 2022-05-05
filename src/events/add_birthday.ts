import { codeBlock } from "@discordjs/builders";
import { Client, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel, Interaction } from "discord.js";
import Event from "../lib/event"
import { ErrorMessage, hasPermission } from "../util/util";

export default class InteractionAutocompleteEvent extends Event {
    constructor(){
        super({
            event: "interactionCreate"
        });
    }

    async execute(client: Client<boolean>, interaction: Interaction): Promise<void> {
        if(!interaction.isButton()) return;
        if(interaction.customId != "ADD_BIRTHDAY") return;
        if(!hasPermission("ManageEvents", interaction.member)) return ErrorMessage(
            "You don't have the correct permissions to add this event!",
            interaction
        );
        if(interaction.guild.scheduledEvents.cache.find(e => e.name === "Server Birthday") != null){
            return ErrorMessage(
                "This server already has an event for the server's birthday...",
                interaction
            );
        }

        const event = await interaction.guild.scheduledEvents.create({
            name: "Server Birthday",
            description: "This server's birthday!",
            entityType: GuildScheduledEventEntityType.External,
            privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
            scheduledStartTime: interaction.guild.createdTimestamp + 31557600000,
            entityMetadata: {
                location: "Right here",
            },
            scheduledEndTime: interaction.guild.createdTimestamp + 31557600000 + 86400000,
        });

        interaction.reply({
            content: `${client.customEmojis.get("check_")} Event created: ${await event.createInviteURL({
                maxAge: 0,
                maxUses: 0,
                //@ts-expect-error
                channel: interaction.channel
            })}`,
            ephemeral: true
        });
    }
}