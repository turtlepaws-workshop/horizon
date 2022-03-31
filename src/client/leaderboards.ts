import { Client, GuildBasedChannel, GuildTextBasedChannel } from "discord.js";
import { Embed } from ".././util/embed";
import { LbModel, LeaderboardsModel } from ".././models/leaderboards";
import { generateLeaderboard } from "./levels";

export default async function initLeaderboards(client: Client){
    //@ts-expect-error
    const lbs: LeaderboardsModel[] = await LbModel.find();

    for(const lb of lbs){
        const guild = await client.guilds.fetch(lb.guildId);
        const channels = await guild.channels.fetch();
        const channel = channels.get(lb.channelId);
        //@ts-expect-error
        const message = await (await channel.messages.fetch()).get(lb.messageId);

        if(!message) return;
        if(message.author.id != client.user.id) return;

        const image = await generateLeaderboard(guild);

        if(image == false) return;

        await message.edit({
            embeds: new Embed()
            .setImage("attachment://leaderboard.png")
            .build(),
            files: [
                image
            ]
        });
    }
}