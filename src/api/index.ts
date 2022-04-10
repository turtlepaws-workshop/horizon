import { Client, Guild } from "discord.js";
import express from "express";
import { changeSettings } from "../client/levels";
import { GuildSettings } from "../entities/settings";

export async function initExpress(client: Client){
    const app = express();

    app.get("/guilds", async (req, res) => {
        if(!client.isReady()){
            res.json({
                error: true,
                message: "Client is not ready"
            })
            return;
        }
        res.json(await client.guilds.fetch());
    });

    app.get("/", async (req, res) => {
        res.json({
            message: "hello world!"
        });
    });

    app.get("/webhook", async (req, res) => {
        //@ts-expect-error
        const name: string = req.query.name;
        //@ts-expect-error
        const avatar: string = req.query.avatar;
        //@ts-expect-error
        const guild = client.guilds.cache.get(req.query.guildId)
        //@ts-expect-error
        const channel = await guild.channels.fetch(req.query.channelId);

        if(!channel || !channel?.isText()) {
            res.json({
                message: "Channel must be a valid text channel",
                error: true
            });
            return;
        }
        if(!name || !avatar || !guild){
            res.json({
                message: "Missing args (possibly name, avatar, or guild)",
                error: true
            });
            return;
        }

        try {
            const webhook = await channel.createWebhook(name, {
                avatar,
                reason: "Created from dashboard"
            });

            res.json({
                error: false,
                data: webhook
            });
        } catch(e) {
            res.json({
                message: e.toString(),
                error: true
            });
        }
    });

    app.get("/settings/guild", async (req, res) => {
        //@ts-expect-error
        const modCommands: boolean = req.query.modCommands;
        //@ts-expect-error
        const guildId: string = req.query.guildId;

        await changeSettings(guildId, async (settings, repo, filter, isNull) => {
            repo.update(filter(), {
                //@ts-expect-error
                guild_modCommands: isNull(modCommands, settings.guild_modCommands)
            });
        });
    });

    app.listen(2000, () => console.log("API up on port 2000 (for local use: http://localhost:2000/)"));
}