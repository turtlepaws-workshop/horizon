import { ButtonBuilder, codeBlock } from "@discordjs/builders";
import { ButtonStyle, Client, Guild, Interaction } from "discord.js";
import { Embed } from "../util/embed";
import { generateDashboardURL, Logs, SupportServer, TestGuild, website } from "../config/config";
import Event from "../lib/event"
import { actionRow, ErrorMessage } from "../util/util";

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
            .setTitle("Hey, welcome to Horizon!")
            .setDescription(`Thanks for adding Horizon to your server. You can start to cofigure your server at [the Horizon Dashboard](${generateDashboardURL(guild.id)}). If you require any help setting up or anything [join our Discord](${SupportServer})`)
            .build(),
            components: [
                actionRow(true,
                    new ButtonBuilder()
                    .setLabel("Configure Server")
                    .setURL(generateDashboardURL(guild.id))
                    .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                    .setLabel("Support")
                    .setURL(SupportServer)
                    .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                    .setLabel("Learn More")
                    .setURL(website)
                    .setStyle(ButtonStyle.Link)
                )
            ]
        });
    }
}