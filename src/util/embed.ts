import { APIEmbed, APIEmbedField, EmbedBuilder as MessageEmbed, EmbedData } from "discord.js";
import { Color } from "../config/config";

export class Embed extends MessageEmbed {
    constructor(data?: Embed){
        if(data != null) super(data.toJSON());
        else super();

        this.setColor(Color);
    }

    addField(name: string, value: string, inline?: boolean) {
        this.addFields([{
            name,
            value,
            inline
        }]);
        return this;
    }

    build(){
        return [this];
    }
}