import { Client, Collection } from "discord.js";
import emojiManager from "./client/emojiManager";
import events from "./client/events";
import menus from "./client/menus";
import { token } from "./config/secrets.json";
import Command from "./lib/command";
import { registerCommands } from "./lib/createCommands";
import { init } from "discord-modals";
import initDB from "./mongoDB";
import initLevels from "./client/levels";

const client = new Client({
    intents: [
        "DIRECT_MESSAGES",
        "GUILDS",
        "GUILD_BANS",
        "GUILD_EMOJIS_AND_STICKERS",
        "GUILD_INTEGRATIONS",
        "GUILD_INVITES",
        "GUILD_MEMBERS",
        "GUILD_SCHEDULED_EVENTS",
        "GUILD_MESSAGES"
    ],
    partials: [
        "CHANNEL",
        "GUILD_MEMBER",
        "GUILD_SCHEDULED_EVENT",
        "USER",
        "MESSAGE"
    ]
});

//Create client varibles
client.commands = {
    private: [],
    public: [],
    all: []
};
client.events = new Collection();
client.customEmojis = new Collection();
client.customEmojisReady = false;
client.menus = new Collection();

//init events
events(client);

//init menus
menus(client);

//init modals
init(client);

//init mongo db
initDB();

//init discord xp
initLevels(client);

//Wait for when the bot is ready
client.on("ready", async () => {
    //Request commands on Discord API
    await registerCommands(client);
    //Log that the bots ready
    console.log(`[CLIENT] Ready as ${client.user.username}...`)
    //Wait for client to be FULLY ready (for emojis, caches, etc...)
    setTimeout(async () => {
        //Init emoji manager
        await emojiManager(client);
        //Log that they are ready
        console.log(`[CLIENT] Emojis ready`)
        //Update client status
        client.customEmojisReady = true;
    }, 4000);
});

//Login with our super secret token!
client.login(token);