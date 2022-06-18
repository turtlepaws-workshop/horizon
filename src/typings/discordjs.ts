import 'discord.js';
import { Collection, Emoji } from 'discord.js';
import { GuildSettingsCache } from '../client/settings';
import Menu from '.././lib/menu';
import Command from '.././lib/command';
import Event from '.././lib/event';
import { GuildSettings } from '../entities/settings';
import { UtilDBManager } from '../sqlite';
import { Plugin } from '../lib/plugin';
import { PluginClasses } from 'src/modules';

interface Settings {
    fetch: () => Promise<GuildSettings>;
    cache: () => GuildSettingsCache;
}

declare module 'discord.js' {
    interface Client {
        commands: {
            private: Command[],
            public: Command[],
            all: Command[]
        };
        rawGuildCommands: ApplicationCommand[];
        rawCommands: ApplicationCommand[];
        events: Collection<string, Event>;
        customEmojis: Collection<string, {
            name: string,
            toString: () => string,
            Id: string,
            URL: string,
            Discordjs: Emoji
        }>;
        customEmojisReady: boolean;
        menus: Collection<string, Menu>;
        settingsCache: Collection<string, GuildSettings>;
        uDB: UtilDBManager;
        plugins: Collection<string, PluginClasses>;
    }
}