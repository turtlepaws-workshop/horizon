import { Client, Colors, Guild } from "discord.js";
import express from "express";
import { changeSettings } from "../client/levels";
import { GuildSettings } from "../entities/settings";
import { API_TOKEN } from "../config/secrets.json"
import { CustomEmbed } from "../entities/embed";
import { AppDataSource } from "../sqlite";
import { v4 } from "uuid";
import { EmbedBuilder } from "@discordjs/builders";
import { website } from "../config/config";
import cors from "cors";
import https from "https";

export async function fetchRepository() {
    return (await AppDataSource).getRepository(CustomEmbed)
}

export async function initExpress(client: Client) {
    const embedRepository = await fetchRepository();

    if (!API_TOKEN) {
        console.warn(
            "There is no API_TOKEN. This might be because you have the dashboard disabled or if you have the dashboard enabled please specify an API_TOKEN or anyone will be able to access the API."
        );
    }

    const app = express();

    app.use(async (req, res, next) => {
        if (req.headers.authorization != API_TOKEN) return res.json({
            error: true,
            message: "Invalid authorization token"
        });
        if (!client.isReady()) {
            return res.json({
                error: true,
                message: "Client is not ready"
            });
        }
        if (!client.customEmojisReady) {
            return res.json({
                error: true,
                message: "Emojis & other stuff are still caching, please wait..."
            });
        }

        next();
        console.log("Passing request", req.headers.authorization)
    });

    app.get("/connection", async (req, res) => {
        res.json({
            message: "Connection ✅",
            error: false
        })
    });

    app.get("/guilds", async (req, res) => {
        res.json({
            error: false,
            data: await client.guilds.fetch(),
            json: (await client.guilds.fetch()).map(guild => guild.id)
        });
    });

    app.get("/guild/:id", async (req, res) => {
        res.json({
            error: false,
            data: await client.guilds.fetch(req.params.id),
            json: await client.guilds.fetch(req.params.id).then(g => g.toJSON())
        });
    })

    app.get("/", async (req, res) => {
        res.json({
            message: "hello world!",
            error: false
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

        if (!channel || !channel?.isText()) {
            res.json({
                message: "Channel must be a valid text channel",
                error: true
            });
            return;
        }
        if (!name || !avatar || !guild) {
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
        } catch (e) {
            res.json({
                data: e.toString(),
                error: true
            });
        }
    });

    app.get("/settings/cache", async (req, res) => {
        res.json({
            ...client.settingsCache.toJSON()
        });
    });

    app.get("/settings/guild", async (req, res) => {
        //@ts-expect-error
        const modCommands: boolean = req.query.modCommands;
        //@ts-expect-error
        const guildId: string = req.query.guildId;

        const updated = await changeSettings(guildId, async (settings, repo, filter, isNull) => {
            repo.update(filter(), {
                //@ts-expect-error
                guild_modCommands: isNull(modCommands, settings.guild_modCommands)
            });
        }).catch(e => {
            res.json({
                error: true,
                message: e.toString()
            })
        });

        res.json({
            error: false,
            data: updated
        })
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

    app.get("/includesBot/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const guild = await client.guilds.fetch(id);

            res.json({
                error: false,
                data: guild != null
            });
        } catch(e){
            res.json({
                error: true,
                data: false
            });
        }
    });
    
    app.get("/hasPermissions/:id", async (req, res) => {
        //@ts-expect-error
        const userID: string = req.query.userID;
        const guildID: string = req.params.id;

        const guild = await client.guilds.fetch(guildID);
        const member = await guild.members.fetch(userID);

        if(member.permissions.has("Administrator") || guild.ownerId == userID) {
            res.json({
                error: false,
                data: true
            });
        } else {
            res.json({
                error: false,
                data: false
            });
        }
    });

    app.get("/channels/:guildId", async (req, res) => {
        const guildId = req.params.guildId;
        const guild = await client.guilds.fetch(guildId);
        
        const channels = await (await guild.channels.fetch()).map(e => e.toJSON());

        res.json({
            error: false,
            data: channels
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
        function str(str: any){
            if(typeof str != "string") return null;
            else return str;
        }

        const dataa = {
            customId: v4(),
            data: JSON.stringify(new EmbedBuilder()
                .setColor(Colors.Blurple)
                .setTitle(str(req.query.title))
                .setDescription(str(req.query.description))
                .setURL(website)
                .setAuthor({
                    name: str(req.query.author_name),
                    url: website
                })
                .setFooter({
                    text: str(req.query.footer_name)
                }).toJSON()),
            userId: str(req.query.userId)
        }

        const data = await embedRepository.save(dataa).catch(e => res.json({
            error: true,
            message: e.toString()
        }));

        res.json({
            error: false,
            data
        });
    });

    // TypeScript Boolean
    // ‾‾  ‾‾     ‾‾
    function tsb(value: any){
        if(typeof value == "string"){
            if(value == "false") return false;
            else if(value == "true") return true;
        } else if(typeof value == "boolean") return value
        else return null;
    }

    app.get("/stats", async (req, res) => {
        try {            
            const lazyLoad = tsb(req.query.lazyLoad == null ? true : req.query.lazyLoad);

            //The exact amount of users that the bot has
            let size = 0;
            //The members that have been counted
            const used = [];
    
            if (lazyLoad == false) {
                //This should:
                //1. Fetch all the guilds
                //2. Fetch the selected guild
                //3. Fetch all the members
                //4. Add the member to the `size` and add them to `used` so they aren't counted double
                //This currently does not work
                //And will not be fixed
                //         ‾‾‾
                for (const oguild of (await client.guilds.fetch()).values()) {
                    const guild = await oguild.fetch();
                    const members = guild.members.fetch();
    
                    for (const member of (await members).values()) {
                        if (used.includes(member.id)) continue;
                        used.push(member.id);
                        size++
                    }
                };
            }
    
            res.json({
                guilds: (await (client.guilds.fetch())).size,
                cacheUsers: client.users.cache.size,
                users: lazyLoad==true ? null : size,
                channels: client.channels.cache.size,
                uptime: client.uptime,
                error: false
            });
        } catch(e){
            res.json({
                error: true,
                message: e.toString()
            })
        }
    });

    app.listen(2000, () => console.log("API up on port 2000 (for local use: http://localhost:2000/)"));
}