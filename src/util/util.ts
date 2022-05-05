import { CommandInteraction, GuildMember, Interaction, ActionRowBuilder as MessageActionRow, ButtonBuilder as MessageButton, SelectMenuBuilder as MessageSelectMenu, PermissionsString as PermissionString, ButtonStyle, AnyComponentBuilder, ComponentType, ActionRowBuilder } from "discord.js";
import { SupportServer } from "../config/config";
import { calculatePermissionForRun } from "./permissions";
import { TimestampStylesString } from "@discordjs/builders";
import { APIInteractionGuildMember } from "discord-api-types";
import { APIActionRowComponent } from "discord-api-types/v10";
import { APIMessageActionRowComponent } from "discord-api-types/v9";

function unixTime(time: Date | number) {
    const date = new Date(time);
    return Math.floor(date.getTime() / 1000);
}

function Timestamp(time: Date | number, type: TimestampStylesString | "NONE" | "") {
    let end = type;
    let endIsNull = false;
    if (type == "NONE") {
        end = ""
        endIsNull = true;
    };

    return `<t:${unixTime(time)}${endIsNull ? "" : ":"}${end}>`
}

async function ErrorMessage(message: string, int: Interaction, emoji: "blob_glitch" | "blob_lurk" | "warning" | "blob_think" = "warning", noEmojis: boolean = false) {
    if (!noEmojis) message = `${int.client.customEmojis.get(emoji)} ${message}`
    const components = [
        {
            type: 1,
            components: [
                new MessageButton()
                    .setLabel(`Support Server`)
                    .setStyle(ButtonStyle.Link)
                    .setURL(SupportServer)
            ]
        }
    ]

    //@ts-ignore
    if (int?.deferred || int?.replied) {
        if (int.isCommand()) {
            return (await int.editReply({
                content: message,
                components
            }));
        } else if (int.isMessageComponent()) {
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

function hasPermission(permission: PermissionString, member: GuildMember | APIInteractionGuildMember | any): boolean {
    return member.permissions.has(permission);
}

export interface ActionRowInterface {
    type: ComponentType;
    components: AnyComponentBuilder[];
}

//@ts-expect-error
export function actionRow<C>(...components: any[]): ActionRowBuilder<C> {
    //@ts-expect-error
    return new MessageActionRow()
        .addComponents(components);
}

export function actionRowJSON(...components: any[]): any {
    return {
        type: ComponentType.ActionRow,
        components
    }
}

export {
    calculatePermissionForRun,
    ErrorMessage,
    Timestamp,
    unixTime,
    hasPermission
}