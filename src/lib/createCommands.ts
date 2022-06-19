import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { token, clientId } from "../config/secrets.json";
import { TestGuild } from "../config/config";
import { ApplicationCommand, Client } from "discord.js";
import klawSync from "klaw-sync";

export async function registerCommands(client: Client) {
    const rest = new REST({ version: '9' }).setToken(token);

    const Commands1 = []; //Private
    const Commands2 = []; //Public

    const CommandFiles = klawSync("./dist/commands", { nodir: true, traverseAll: true, filter: f => f.path.endsWith('.js') });

    for (const CommandFile of CommandFiles) {
        const rCommand = require(CommandFile.path);
        const command = new rCommand.default();
        if (!command || command?.isCommand == false) continue;

        if(command.dev){
            Commands1.push(command.builder);
        } else {
            Commands2.push(command.builder);
        }
    }

    for (const pluginR of client.plugins.values()) {
        const plugin = new pluginR();
        await plugin.start(client);
        for(const Command of plugin.builders.commands){
            if(Command.dev){
                Commands1.push(Command);
            } else {
                Commands2.push(Command);
            }
        }
        
        for(const ContextMenu of plugin.builders.menus){
            if(ContextMenu.dev){
                Commands1.push(ContextMenu);
            } else {
                Commands2.push(ContextMenu);
            }
        }
    }

    for (const MenuFile of client.menus.values()) {
        const menu = MenuFile;
        if (!menu) continue;

        if(menu.dev){
            Commands1.push(menu.builder);
        } else {
            Commands2.push(menu.builder);
        }
    }

    client.commands.private = Commands1;
    client.commands.public = Commands2;
    client.commands.all = [...Commands2, ...Commands1];

    rest.put(Routes.applicationGuildCommands(clientId, TestGuild), { body: Commands1.map(e => e.toJSON())})
        .then((commands: ApplicationCommand[]) => {
            client.rawGuildCommands = commands
            console.log('[COMMANDS] Successfully registered application commands. (Private)'.blue);
        })
        .catch(console.error);

    rest.put(Routes.applicationCommands(clientId), { body: Commands2.map(e => e.toJSON())})
        .then((commands: ApplicationCommand[]) => {
            client.rawCommands = commands
            console.log('[COMMANDS] Successfully registered application commands. (Public)'.blue)
        })
        .catch(console.error);
}