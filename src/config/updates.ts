import { ButtonBuilder as MessageButton, ButtonStyle } from "discord.js";
import { Embed } from "../util/embed";
import { createURL, website } from "./config";

export interface NewFeature {
    name: string;
    description: string;
    emoji?: string;
}

export const WhatsNew: NewFeature[] = [
    {
        name: "Dashboard (WIP)",
        description: "Check out the WIP dashboard [here](https://horizon-deploy-preview.vercel.app/). Be sure to log any bugs you find! 👀",
        emoji: "<:gear:966801721382801468>"
    }
];

export function GenerateEmbed(){
    const ebd = new Embed()
    .setTitle("What's new")
    .setURL(createURL("whats-new"));

    for(const item of WhatsNew){
        ebd.addField(`${item.emoji != null ? `${item.emoji} ` : ""}${item.name}`, item.description);
    }

    return ebd;
}

export function GenerateButton(){
    return new MessageButton()
    .setStyle(ButtonStyle.Primary)
    .setLabel("What's new")
    .setCustomId("whats_new");
}