import { CustomEmbed } from "../entities/embed";
import { MessageEmbed } from "discord.js";

export function parseEmbed(data: CustomEmbed){
    return new MessageEmbed(JSON.parse(data.embedData));
}