import { codeBlock } from "@discordjs/builders";
import { Client, Interaction, Message } from "discord.js";
import { hasLevels } from ".././client/settings";
import { addMessage, addXP, removeXP } from ".././client/levels";
import Event from "../lib/event"
import { ErrorMessage } from "../util/util";

export default class LevelMessageEvent extends Event {
    constructor(){
        super({
            event: "messageCreate"
        });
    }

    async execute(client: Client<boolean>, message: Message): Promise<void> {
        if(message.author.bot) return;
        if(!hasLevels(message.guild)){
            await addMessage(message.member);
            return;
        }

        const res = await addMessage(message.member);
        if(res.levels.leveledUp){
            message.channel.send({
                content: `GG ${message.author}. You have leveled up to level ${res.levels.user.level}!`
            })
        }
    }
}