import { Client, Collection } from "discord.js";
import BetterVerification from "./BetterVerification/index";

let client: Client;

//Typings
export type Plugin = "SlashCommands" | "InviteNotes" | "BetterVerification" | "BetterTickets";
export type PluginClasses = (typeof BetterVerification);
export enum Plugins {
    SlashCommands = "SlashCommands",
    InviteNotes = "InviteNotes",
    BetterVerification = "BetterVerification",
    BetterTickets = "BetterTickets"
}
export const PluginArr = [Plugins.BetterVerification]; //[Plugins.SlashCommands, Plugins.InviteNotes, Plugins.BetterVerification, Plugins.BetterTickets];

export function usePlugin(plugin: Plugin){
    client.plugins.set(plugin, BetterVerification);
}

export function initPlugins(clientp: Client){
    client = clientp;
    clientp.plugins = new Collection();
}