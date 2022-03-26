import { CommandInteraction, Interaction, MessageButton } from "discord.js";
import { SupportServer } from ".././config/config";
import { calculatePermissionForRun } from "./permissions";
import { TimestampStylesString } from "@discordjs/builders";

function unixTime(time: Date|number){
    const date = new Date(time);
    return Math.floor(date.getTime() / 1000);
}

function Timestamp(time: Date|number, type: TimestampStylesString|"NONE"|"") {
    let end = type;
    let endIsNull = false;
    if(type == "NONE") {
        end = ""
        endIsNull = true;
    };

    return `<t:${unixTime(time)}${endIsNull ? "" : ":"}${end}>`
}

async function ErrorMessage(message: string, int: Interaction, noEmojis: boolean = false){
    if(!noEmojis) message = `${int.client.customEmojis.get("warning")} ${message}`
    const components = [
        {
            type: 1,
            components: [
                new MessageButton()
                .setLabel(`Support Server`)
                .setStyle("LINK")
                .setURL(SupportServer)
            ]
        }
    ]

    //@ts-ignore
    if(int?.deferred || int?.replied){
        if(int.isApplicationCommand()){
            return (await int.editReply({
                content: message,
                components
            }));
        } else if(int.isMessageComponent()){
            return (await int.update({
                content: message,
                components
            }));
        }
    } else {
        //@ts-ignore
        return (await int.reply({
            ephemeral: true,
            content: message,
            components
        }))
    }
}

export {
    calculatePermissionForRun,
    ErrorMessage,
    Timestamp,
    unixTime
}