import { ColorResolvable } from "discord.js";

export interface HorizonLogs {
    guilds: string;
    //rateLimits: string;
    //cooldown: string;
}

export const Color: ColorResolvable = "#F28458";
export const TestGuild: string = "842575277249921074";
export const SupportServer: string = "https://discord.gg/UTBuzEfFrS";
export const website: string = "https://horizon.trtle.xyz/"
export function createURL(path: string){
    return website + path;
}
export const Logs: HorizonLogs = {
    guilds: "957001264296767549"
}
export function generateDashboardURL(guildId: string){
    return `${website}guilds/${guildId}`;
}
export const Developers = [
    "820465204411236362"
];