import "colors";
import { Client, Collection, IntentsBitField, Partials } from "discord.js";
import emojiManager from "./client/emojiManager";
import events from "./client/events";
import menus from "./client/menus";
import { token } from "./config/secrets.json";
import Command from "./lib/command";
import { registerCommands } from "./client/handler";
import { init } from "discord-modals";
import initLevels from "./client/levels";
import initLeaderboards from "./client/leaderboards";
import "reflect-metadata"
import { initExpress } from "./api";
import { GuildSettingsCache } from "./client/settings";
import { AllIntents, AllPartials } from "./lib/all";
import "./lib/extends";
import { UtilDBManager } from "./sqlite";
import { initPlugins, usePlugin } from "./util/modules";
import { setPluginVaribles } from "./client/set";
import { useAciiMessage } from "./util/aciiMessage";
const Intents = IntentsBitField.Flags;

//log acii message
useAciiMessage();

const client = new Client({
    intents: [
        Intents.DirectMessageReactions,
        Intents.DirectMessages,
        Intents.GuildBans,
        Intents.GuildEmojisAndStickers,
        Intents.GuildInvites,
        Intents.GuildMembers,
        Intents.GuildMessageReactions,
        Intents.GuildMessages,
        Intents.GuildScheduledEvents,
        Intents.GuildWebhooks,
        Intents.Guilds,
        Intents.MessageContent
    ],
    partials: [
        ...AllPartials()
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

//Plugins
initPlugins(client);
usePlugin("BetterVerification");
setPluginVaribles(client);

//init events
events(client);

//init menus
menus(client);

//init modals
//[DEPRECATED] Now using discord v14 modals
//init(client);

//init mongo db
//[DEPRECATED] Now using sqlite instead
//initDB();

//init discord xp
initLevels(client);

//Wait for when the bot is ready
client.on("ready", async () => {
    //Request commands on Discord API
    await registerCommands(client);
    //Log that the bots ready
    console.log(`[CLIENT] Ready as ${client.user.username}...`.blue)
    //Wait for client to be FULLY ready (for emojis, caches, etc...)
    setTimeout(async () => {
        //Init emoji manager
        await emojiManager(client);
        //Log that they are ready
        console.log(`[CLIENT] Emojis ready`.blue)
        //Update client status
        client.customEmojisReady = true;
        //init api
        //only needed if you have the dashboard
        await initExpress(client)
    }, 4000);
    //for every 5s update all leaderboards
    setInterval(async () => {
        //init leaderboard editing
        initLeaderboards(client);
    });
    client.settingsCache = await new GuildSettingsCache(client).init();

    //Create utils
    client.uDB = new UtilDBManager();
});

//Login with our super secret token!
client.login(token);