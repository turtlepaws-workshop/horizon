import { Client, Collection } from "discord.js";
import * as klawSync from "klaw-sync";
import { token } from "./config/secrets.json";
import Command from "./lib/command";
import { registerCommands } from "./lib/createCommands";

const client = new Client({
    intents: [
        "DIRECT_MESSAGES",
        "GUILDS",
        "GUILD_BANS",
        "GUILD_EMOJIS_AND_STICKERS",
        "GUILD_INTEGRATIONS",
        "GUILD_INVITES",
        "GUILD_MEMBERS",
        "GUILD_SCHEDULED_EVENTS"
    ],
    partials: [
        "CHANNEL",
        "GUILD_MEMBER",
        "GUILD_SCHEDULED_EVENT",
        "USER"
    ]
});

client.commands = {
    private: [],
    public: [],
    all: []
};

const EventFiles = klawSync("./dist/events", { nodir: true, traverseAll: true, filter: f => f.path.endsWith('.js') });

for(const EventFile of EventFiles){
    const rEvent = require(EventFile.path);
    const event = new rEvent.default();

    if (event?.once) {
        client.once(event.event, (...args) => event.execute(client, ...args));
    } else {
        client.on(event.event, (...args) => event.execute(client, ...args));
    }
}

client.on("ready", async () => {
    await registerCommands(client);
    console.log(`[CLIENT] Ready as ${client.user.username}...`)
});

client.login(token);