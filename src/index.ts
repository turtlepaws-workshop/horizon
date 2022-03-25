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

client.commands = new Collection<string, Command>();

const EventFiles = klawSync("./dist/events", { nodir: true, traverseAll: true, filter: f => f.path.endsWith('.js') });

for(const EventFile of EventFiles){
    const event = require(EventFile.path);
    if(event == null) continue;

    if (event?.once) {
        client.once(event.event, (...args) => event.execute(client, ...args));
    } else {
        client.on(event.event, (...args) => event.execute(client, ...args));
    }
}

const CommandFiles = klawSync("./dist/commands", { nodir: true, traverseAll: true, filter: f => f.path.endsWith('.js') });

for(const CommandFile of CommandFiles){
    const command = require(CommandFile.path);
    if(!command || command?.isCommand == false) continue;

    client.commands.set(command.name, command);
}

client.on("ready", async () => {
    await registerCommands(client);
});

client.login(token);