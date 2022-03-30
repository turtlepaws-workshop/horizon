import { Schema, model } from 'mongoose';

const name = "messages";
const schema = new Schema({
    userId: String,
    messages: Number
});

export default model(name, schema);
export const Model = model(name, schema);
export interface MessageModel {
    userId: string;
    messages: number;
    save: () => Promise<void>;
}