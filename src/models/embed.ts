import { Schema, model } from 'mongoose';

const name = "embed";
const schema = new Schema({
    data: Object,
    userId: String,
    customId: String
});

export default model(name, schema);