import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { token, clientId } from "../config/secrets.json";
import { TestGuild } from "../config/config";
import { ApplicationCommand, Client } from "discord.js";

export async function registerCommands(client: Client) {
    const rest = new REST({ version: '9' }).setToken(token);

    const Commands1 = client.commands.map(e => {
        if(e.dev) return;
        return e.builder.toJSON();
    }); //Private
    const Commands2 = client.commands.map(e => {
        if(!e.dev) return;
        return e.builder.toJSON();
    }); //Public

    rest.put(Routes.applicationGuildCommands(clientId, TestGuild), { body: Commands1 })
        .then((commands: ApplicationCommand[]) => {
            client.rawGuildCommands = commands
            console.log('[COMMANDS] Successfully registered application commands. (Private)');
        })
        .catch(console.error);

    rest.put(Routes.applicationCommands(clientId), { body: Commands2 })
        .then((commands: ApplicationCommand[]) => {
            client.rawCommands = commands
            console.log('[COMMANDS] Successfully registered application commands. (Public)')
        })
        .catch(console.error);
}