import { InteractionType, CommandInteraction, GuildMember, Interaction, ActionRowBuilder as MessageActionRow, ButtonBuilder as MessageButton, SelectMenuBuilder as MessageSelectMenu, PermissionsString as PermissionString, ButtonStyle, AnyComponentBuilder, ComponentType, ActionRowBuilder, ButtonInteraction, SelectMenuInteraction, AutocompleteInteraction } from "discord.js";
import { SupportServer } from "../config/config";
import { calculatePermissionForRun } from "./permissions";
import { TimestampStylesString } from "@discordjs/builders";
import { APIInteractionGuildMember } from "discord-api-types/v9";
import { APIActionRowComponent } from "discord-api-types/v10";
import { APIMessageActionRowComponent } from "discord-api-types/v9";

export type isComponentTypes = ButtonInteraction | SelectMenuInteraction;

export function isComponent(interaction: Interaction | any): interaction is isComponentTypes {
    return interaction?.type == InteractionType.MessageComponent;
}

export function isAutocomplete(interaction: Interaction | any): interaction is AutocompleteInteraction {
    return interaction?.type == InteractionType.ApplicationCommandAutocomplete;
}

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

async function ErrorMessage(message: string, int: Interaction, emoji: "blob_glitch" | "blob_lurk" | "warning" | "blob_think" | "fe_warning" = "fe_warning", noEmojis: boolean = false) {
    if(emoji == "warning") emoji = "fe_warning";
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
        if (int.isChatInputCommand()) {
            return (await int.editReply({
                content: message,
                components
            }));
        } else if (isComponent(int)) {
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

export function isVoid(value: any): boolean {
    return value == null;
}

export {
    calculatePermissionForRun,
    ErrorMessage,
    Timestamp,
    unixTime,
    hasPermission
}