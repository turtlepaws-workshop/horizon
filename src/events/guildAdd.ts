import { codeBlock } from "@discordjs/builders";
import { Client, Guild, Interaction } from "discord.js";
import { Embed } from "../util/embed";
import { Logs, TestGuild } from "../config/config";
import Event from "../lib/event"
import { ErrorMessage } from "../util/util";

export default class InteractionAutocompleteEvent extends Event {
    constructor(){
        super({
            event: "guildCreate"
        });
    }

    async execute(client: Client<boolean>, guild: Guild): Promise<void> {
        const owner = await guild.fetchOwner();
        const guildLoggingChannel = await (await client.guilds.fetch(TestGuild)).channels.fetch(Logs.guilds);

        owner.send({
            embeds: new Embed()
            .setTitle("Hey")
            .build()
        })
    }
}