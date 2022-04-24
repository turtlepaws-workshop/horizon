import { APIEmbedField, EmbedBuilder as MessageEmbed } from "discord.js";
import { Color } from "../config/config";

export class Embed extends MessageEmbed {
    constructor(){
        super();

        this.setColor(Color);
    }

    addField(name: string, value: string, inline?: boolean) {
        this.addFields({
            name,
            value,
            inline
        });
        return this;
    }

    build(){
        return [this];
    }
}