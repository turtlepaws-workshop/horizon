import { Schema, model } from 'mongoose';

const name = "leaderboards";
const schema = new Schema({
    guildId: String,
    messageId: String,
    channelId: String
});

export default model(name, schema);
export const LbModel = model(name, schema);
export interface LeaderboardsModel {
    guildId: string;
    messageId: string;
    channelId: string;
    save: () => Promise<void>;
}