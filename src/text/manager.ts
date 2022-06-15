import { Client, Interaction, Message } from "discord.js";
import { SupportServer, website } from "../config/config";
import Text from "./text.json";

const customPlaceholders = {
    "{supportURL}": SupportServer,
    "{websiteURL}": website
};

export type TextCategory = keyof typeof Text;

//We'll add support for multiple languages soon
//SIDE NOTE ON FUNCTION BEING ASYNC:
//We're using async here because we'll need it for multiple languages support
//so then we can fetch the language from the guild settings

export async function get(
    key: TextCategory,
    interaction: Interaction | Message
) {
    const { client } = interaction;
    let text: string = Text[key];

    for(const e of client.customEmojis.values()){
        text = text.replaceAll(
            `{${e.name}}`,
            e.toString()
        )
    }

    for(const ph of Object.keys(customPlaceholders)){
        text = text.replaceAll(
            ph,
            customPlaceholders[ph]
        );
    }

    return text;
}