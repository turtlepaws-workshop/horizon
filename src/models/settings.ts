import { HexColorString } from 'discord.js';
import { Schema, model } from 'mongoose';

const name = "settings";
const schema = new Schema({
    guildId: String,
    levels: {
        enabled: Boolean,
        message: String,
        embed: Boolean,
        cardBackgroundURL: String,
        cardProgressBar: String
    },
    automod: {
        enabled: Boolean,
        bannedWords: Map //<word, word>
    },
    guild: {
        modCommands: Boolean
    }
});

export default model(name, schema);
export const Model = model(name, schema);
export interface GuildSettingsModel {
    guildId: string;
    levels: {
        enabled: boolean;
        messageChannel: string | null;
        message: string;
        embed: boolean;
        cardBackgroundURL: string;
        cardProgressBar: HexColorString
    };
    automod: {
        enabled: boolean;
        bannedWords: Map<string, string>,
    };
    guild: {
        modCommands: boolean;
    }
    save?: () => Promise<void>;
}