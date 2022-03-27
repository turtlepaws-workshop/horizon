import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { token, clientId } from "../config/secrets.json";
import { TestGuild } from "../config/config";
import { ApplicationCommand, Client } from "discord.js";
import * as klawSync from "klaw-sync";

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
            Commands1.push(command);
        } else {
            Commands2.push(command);
        }
    }

    for (const MenuFile of client.menus.values()) {
        const menu = MenuFile;
        if (!menu) continue;

        if(menu.dev){
            Commands1.push(menu);
        } else {
            Commands2.push(menu);
        }
    }

    client.commands.private = Commands1;
    client.commands.public = Commands2;
    client.commands.all = [...Commands2, ...Commands1];

    rest.put(Routes.applicationGuildCommands(clientId, TestGuild), { body: Commands1.map(e => e.builder.toJSON()) })
        .then((commands: ApplicationCommand[]) => {
            client.rawGuildCommands = commands
            console.log('[COMMANDS] Successfully registered application commands. (Private)');
        })
        .catch(console.error);

    rest.put(Routes.applicationCommands(clientId), { body: Commands2.map(e => e.builder.toJSON()) })
        .then((commands: ApplicationCommand[]) => {
            client.rawCommands = commands
            console.log('[COMMANDS] Successfully registered application commands. (Public)')
        })
        .catch(console.error);
}