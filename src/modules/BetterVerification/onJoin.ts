import { ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle, Client, GuildMember, MessageOptions } from "discord.js";
import { createURL, website } from "../../config/config";
import { Embed } from "../../util/embed";
import { actionRowJSON } from "../../util/util";
import Event from "../../lib/event";

export default class OnJoin extends Event {
    constructor(){
        super({
            event: "guildMemberAdd"
        });
    }

    async execute(client: Client<boolean>, member: GuildMember): Promise<void> {
        const payload: MessageOptions = {
            components: actionRowJSON(
                new ButtonBuilder()
                .setLabel("Start Verification")
                .setStyle(ButtonStyle.Primary)
                .setCustomId("START_VERFICATION"),
                new ButtonBuilder()
                .setLabel("Learn More")
                .setStyle(ButtonStyle.Link)
                .setURL(createURL("/verification"))
            ),
            embeds: new Embed()
            .setTitle(`Verification for ${member.guild.name.length >= 5 ? `${member.guild.name.slice(0, 5)}...` : member.guild.name}`)
            .setDescription(`This server has enabled [Verification](${createURL("/verification")}).\n\nStart your adventure by click the button below.`)
            .build()
        };

        await member.send(payload);
    }
}