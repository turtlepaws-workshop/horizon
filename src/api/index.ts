import { Client, Guild } from "discord.js";
import express from "express";
import { changeSettings } from "../client/levels";
import { GuildSettings } from "../entities/settings";
import { API_TOKEN } from "../config/secrets.json"
import { CustomEmbed } from "../entities/embed";
import { AppDataSource } from "../sqlite";

export async function fetchRepository(){
    return (await AppDataSource).getRepository(CustomEmbed)
}

export async function initExpress(client: Client){
    const embedRepository = await fetchRepository();

    if(!API_TOKEN){
        console.warn(
            "There is no API_TOKEN. This might be because you have the dashboard disabled or if you have the dashboard enabled please specify an API_TOKEN or anyone will be able to access the API."
        );
    }

    const app = express();

    app.use(async (req, res) => {
        if(req.headers.authorization != API_TOKEN) return res.json({
            error: true,
            message: "Invalid authorization token"
        });
        if(!client.isReady()){
            return res.json({
                error: true,
                message: "Client is not ready"
            });
        }
        if(!client.customEmojisReady){
            return res.json({
                error: true,
                message: "Emojis & other stuff are still caching, please wait..."
            });
        }
    });

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

    app.get("/settings/cache", async (req, res) =>  {
        res.json({
            ...client.settingsCache.toJSON()
        });
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

    app.get("/embeds/fetch", async (req, res) => {
        const fetch = await embedRepository.find();

        res.json({
            ...fetch
        });
    });

    app.get("/embeds/:id", async (req, res) => {
        const id = req.params.id;
        const fetch = await embedRepository.findBy({
            userId: id
        });

        res.json({
            ...fetch
        });
    });

    app.get("/embed/:customId", async (req, res) => {
        const customId = req.params.customId;
        const fetch = await embedRepository.findOneBy({
            customId
        });

        res.json({
            ...fetch
        });
    });

    app.post("/embed/create", async (req, res) => {
        //Something to get data
    });

    app.listen(2000, () => console.log("API up on port 2000 (for local use: http://localhost:2000/)"));
}