import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "@discordjs/builders";
import { Client, EmbedBuilder as MessageEmbed, PermissionsString } from "discord.js";
import { ContextMenuBuilder, ContextMenuType } from "discord.js-util";
import Event from "../lib/event";
import HorizonSlashCommandBuilder from "../lib/SlashCommandBuilder";
import { Categories } from "./types";

export type ModifiedContextMenuBuilder = any;
export type ModifiedHorizonSlashCommandBuilder = any;

export type PermissionString = PermissionsString | "Developer";

export interface EmbedModel {
    userId: string;
    customId: string;
    data: MessageEmbed;
}

export interface PluginFile {
    location: string;
}

export type AnyBuilder = HorizonSlashCommandBuilder | ContextMenuBuilder;

export interface Builders {
    commands: ModifiedHorizonSlashCommandBuilder[];
    menus: ModifiedContextMenuBuilder[];
}

export interface PluginFiles {
    events: PluginFile[];
    commands: PluginFile[];
    menus: PluginFile[];
}

export interface PluginOptions {
    /**
     * The name of the plugin.
     */
    name: string;
    /**
     * The context menus to register.
     */
    contextMenus: ModifiedContextMenuBuilder[];
    /**
     * The commands to register.
     */
    commands: ModifiedHorizonSlashCommandBuilder[];
    /**
     * The files used for handling stuff.
     */
    files: PluginFiles;
    /**
     * This will be executed on start.
     */
    start: (client: Client) => Promise<void>;
}

export interface CommandOptions {
    /**
     * The command builder similar to @discord.js/builders.
     */
    commandBuilder: HorizonSlashCommandBuilder;
    /**
     * The required permissions for the user to command to run.
     */
    requiredPermissions: PermissionString[];
    /** 
     * The permissions that the bot needs to run this command.
    */
    runPermissions: PermissionsString[];
    /**
     * If the command should only be registered in the dev server.
     */
    dev?: boolean;
    /**
     * If the user has one or more of these permissions, the command will run.
     */
    somePermissions: PermissionString[];
    /**
     * If the command can only be run in servers and not DMs.
     */
    serverOnly?: boolean;
    category: Categories;
}

export interface MenuOptions {
    /**
     * The required permissions for the user to command to run.
     */
    requiredPermissions: PermissionString[];
    /** 
     * The permissions that the bot needs to run this command.
    */
    runPermissions: PermissionsString[];
    /**
     * If the command should only be registered in the dev server.
     */
    dev?: boolean;
    /**
     * If the user has one or more of these permissions, the command will run.
     */
    somePermissions: PermissionString[];
    /**
     * If the command can only be run in servers and not DMs.
     */
    serverOnly?: boolean;
    /**
     * The name of the context menu. Can be uppercase and contain spaces. (e.g. "Kick User")
     */
    name: string;
    /**
     * The type of the context menu.
     */
    type: ContextMenuType;
}

export interface EventOptions {
    event: DiscordClientEvents;
    once?: boolean;
}

export type DiscordClientEvents =
    | "apiRequest"
    | "apiResponse"
    | "applicationCommandCreate"
    | "applicationCommandDelete"
    | "applicationCommandUpdate"
    | "channelCreate"
    | "channelDelete"
    | "channelPinsUpdate"
    | "channelUpdate"
    | "debug"
    | "emojiCreate"
    | "emojiDelete"
    | "emojiUpdate"
    | "error"
    | "guildBanAdd"
    | "guildBanRemove"
    | "guildCreate"
    | "guildDelete"
    | "guildIntegrationsUpdate"
    | "guildMemberAdd"
    | "guildMemberAvailable"
    | "guildMemberRemove"
    | "guildMembersChunk"
    | "guildMemberUpdate"
    | "guildUnavailable"
    | "guildUpdate"
    | "interaction"
    | "interactionCreate"
    | "invalidated"
    | "invalidRequestWarning"
    | "inviteCreate"
    | "inviteDelete"
    | "message"
    | "messageCreate"
    | "messageDelete"
    | "messageDeleteBulk"
    | "messageReactionAdd"
    | "messageReactionRemove"
    | "messageReactionRemoveAll"
    | "messageReactionRemoveEmoji"
    | "messageUpdate"
    | "presenceUpdate"
    | "rateLimit"
    | "ready"
    | "roleCreate"
    | "roleDelete"
    | "roleUpdate"
    | "shardDisconnect"
    | "shardError"
    | "shardReady"
    | "shardReconnecting"
    | "shardResume"
    | "stageInstanceCreate"
    | "stageInstanceDelete"
    | "stageInstanceUpdate"
    | "stickerCreate"
    | "stickerDelete"
    | "stickerUpdate"
    | "threadCreate"
    | "threadDelete"
    | "threadListSync"
    | "threadMembersUpdate"
    | "threadMemberUpdate"
    | "threadUpdate"
    | "typingStart"
    | "userUpdate"
    | "voiceStateUpdate"
    | "warn"
"webhookUpdate"