import { MessageEmbed } from "discord.js";
import { Color } from "../config/config";

export class Embed extends MessageEmbed {
    constructor(){
        super();

        this.setColor(Color);
    }

    build(){
        return [this];
    }
}