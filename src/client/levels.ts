import { Channel, Client, Guild, GuildMember, HexColorString, Message, Attachment as MessageAttachment, EmbedBuilder as MessageEmbed, User, Attachment } from "discord.js";
import TypeormDiscordXp from "discord-xp-typeorm";
import { MessageModel, Model } from ".././models/messages";
export const defaultMessageLevel = 50;
import { EventEmitter } from "events";
import { Rank } from "canvacord";
import * as Canvas from "canvas";
import { Leaderboards } from "../entities/leaderboards";
import { LbModel, LeaderboardsModel } from ".././models/leaderboards";
import settings, { GuildSettingsModel } from ".././models/settings";
import { GuildSettings } from ".././entities/settings";
import { AppDataSource } from ".././sqlite";
import StringMap, { parseStringMap } from ".././lib/stringmap";
import StringSet, { parseStringSet } from ".././lib/StringSet";
import { FindOptionsWhere, Repository } from "typeorm";
import { User as UserEntity } from "../entities/user";
import { ALLOWED_EXTENSIONS } from "@discordjs/rest";
import { generateLeaderboard as createLeaderboard } from "paintfordiscord";
let XPLevels: TypeormDiscordXp;

//https://www.npmjs.com/package/discord-xp
export default async function initLevels(client: Client) {
    XPLevels = new TypeormDiscordXp(await AppDataSource);
}

//xp: the xp to add
//member: the discord.js guild member
export async function addXP(member: GuildMember, xp: number) {
    const xpUser = await XPLevels.fetch(member.id, member.guild.id);
    let beforeAdd = xpUser.level;
    await XPLevels.appendXp(member.id, member.guild.id, xp);
    const newXpUser = await XPLevels.fetch(member.id, member.guild.id);
    if (beforeAdd != newXpUser.level) {
        client.emit("levelUp", newXpUser, member);
        return {
            user: newXpUser,
            leveledUp: true
        }
    }
    return {
        user: newXpUser,
        leveledUp: false
    }
}

export async function replacePlaceholders(string: string, userId: string, guildId: string, dClient: Client){
    const user = await XPLevels.fetch(userId, guildId);
    const dUser = await dClient.users.fetch(userId);
    const guild = await dClient.guilds.fetch(guildId);
    const dMember = await guild.members.fetch(userId);
    const nickname = dMember.nickname;

    return string.replaceAll(`{{level}}`, user.level.toString())
    .replaceAll(`{{cleanNextLevelXP}}`, user.cleanNextLevelXp.toString())
    .replaceAll(`{{cleanXP}}`, user.cleanXp.toString())
    .replaceAll(`{{XP}}`, user.xp.toString())
    .replaceAll(`{{userMention}}`, dUser.toString())
    .replaceAll(`{{userTag}}`, dUser.tag)
    .replaceAll(`{{userName}}`, dUser.username)
    .replaceAll(`{{userNickname}}`, nickname)
    .replaceAll(`{{guild}}`, guild.toString());
}

export async function createSettings(guildId: string): Promise<GuildSettings> {
    const SettingsRepo = await (await AppDataSource).getRepository("GuildSettings");

    const checking = await SettingsRepo.findOneBy({ 
        guildId: guildId
    });

    //@ts-expect-error
    if(checking != null) return checking;

    const defualtCreateParams = {
        guildId: guildId,
        automod: {
            bannedWords: new Map(),
            enabled: false
        },
        guild: {
            modCommands: false
        },
        levels: {
            cardBackgroundURL: null,
            cardProgressBar: "#5865f2",
            embed: false,
            enabled: false,
            message: "GG {{userMention}}. You leveled up to level {{level}}!",
            messageChannel: null
        }
    };

    const map = new StringMap();

    //https://npm.im/typeorm
    let newSettings = new GuildSettings();
    newSettings = {
        guildId,
        automod_enabled: false,
        automod_bannedWords: "",
        automod_filters: "",
        guild_modCommands: false,
        levels_cardBackgroundURL: null,
        levels_cardProgressBar: "#5865f2",
        levels_embed: false,
        levels_message: "GG {{userMention}}. You leveled up to level {{level}}!",
        levels_enabled: false,
        levels_messageChannel: null,
        logs_channel: null,
        logs_enabled: false,
        starboard_channel: null,
        starboard_enabled: false,
        automod_links: "",
        automod_links_whitelist: ""
    };

    await SettingsRepo.save(newSettings);

    const newCheck = await SettingsRepo.findOneBy({ 
        guildId: guildId
    });

    //@ts-expect-error
    return newCheck;
}

export interface ParsedGuildSettings {
    guildId: string;
    levels_enabled: boolean;
    levels_messageChannel: string | null | Channel;
    levels_message: string;
    levels_embed: boolean;
    levels_cardBackgroundURL: string;
    levels_cardProgressBar: HexColorString;
    automod_enabled: boolean;
    automod_bannedWords: StringMap<string, string>;
    //@ts-expect-error
    automod_filters: StringSet<"LINK"|"BAD_WORD"|"DISCORD_INVITE"|"REDIRECT">;
    guild_modCommands: boolean;
    guild?: Guild;
}

export function parseGuildData(data: GuildSettings, client?: Client): ParsedGuildSettings {
    const guild = client != null ? client.guilds.cache.get(data.guildId) : null;
    const levels_messageChannel = client != null ? guild.channels.cache.get(data.levels_messageChannel) : null;
    return {
        //@ts-expect-error
        automod_bannedWords: parseStringMap(data.automod_bannedWords, "STRING_MAP"),
        automod_enabled: data.automod_enabled,
        automod_filters: parseStringSet(data.automod_filters, "STRING_SET"),
        guildId: data.guildId,
        guild_modCommands: data.guild_modCommands,
        levels_cardBackgroundURL: data.levels_cardBackgroundURL,
        levels_cardProgressBar: data.levels_cardProgressBar,
        levels_embed: data.levels_embed,
        levels_enabled: data.levels_enabled,
        levels_message: data.levels_message,
        levels_messageChannel: client != null ? levels_messageChannel : data.levels_messageChannel,
        guild
    }
}

export async function changeSettings(guildId: string, callback: (guildSettings: GuildSettings, settingsRepository: Repository<GuildSettings>, genFilter: () => FindOptionsWhere<GuildSettings>, isNull: (val: unknown, defaultValue?: unknown) => typeof val | typeof defaultValue, save: (ths: any) => void) => Promise<void>, client?: Client){
    const SettingsRepo = (await AppDataSource).getRepository("GuildSettings");
    const settings_ = await createSettings(guildId);
    const parsed = parseGuildData(settings_, client);

    //@ts-expect-error
    return callback(settings_, SettingsRepo, () => ({
        guildId
    }), (val, defaultValue) => {
        if(defaultValue){
            return (val == null ? defaultValue : val);
        } else {
            return val == null;
        }
    }, async (ths) => {
        await SettingsRepo.save(ths);
    });
}

export async function generateRankCard(member: GuildMember) {
    const xpUser = await XPLevels.fetch(member.id, member.guild.id);
    const leaderboard = await XPLevels.fetchLeaderboard(member.guild.id, 100);
    //@ts-expect-error
    const rank: string = (leaderboard.findIndex(e => e.userID == member.user.id)+1);

    if(!xpUser) return false;
    
    const rankCard = await new Rank()
        .setAvatar(member.displayAvatarURL({
            extension: "jpg"
        }))
        .setCurrentXP(xpUser.xp)
        .setLevel(xpUser.level)
        //@ts-expect-error
        .setRank(rank)
        .setRequiredXP(XPLevels.xpFor(xpUser.level+1))
        .setStatus("online", true)
        .setProgressBar("#5865f2", "COLOR")
        .setUsername(member.displayName || member.user.username)
        .setDiscriminator(member.user.discriminator)
        .build({ });

    return rankCard;
}

export async function generateLeaderboard(guild: Guild){
    //Fetch leaderboard
    const rawLeaderboard = await XPLevels.fetchLeaderboard(guild.id, 10);
    const users = await XPLevels.computeLeaderboard(guild.client, rawLeaderboard, true);
    
    //Return if there's no leaderboard
    if(!users) return false;

    const dUsers = await guild.members.fetch();
    const img = await createLeaderboard(users.map(e => {
        const user = dUsers.get(e.userID);
        return ({
            score: e.level,
            username: user.user.username,
            avatarURL: user.avatarURL(),
            nickname: user.nickname
        })
    }));

    return img;
}

//xp: the xp to subtract from their xp
//member: the discord.js guild member
export async function removeXP(member: GuildMember, xp: number) {
    const xpUser = await XPLevels.fetch(member.id, member.guild.id);
    await XPLevels.subtractXp(member.id, member.guild.id, xp);
    return xpUser;
}

//adds a message to the user & xp
export async function addMessage(member: GuildMember) {
    const MessageRepository = (await AppDataSource).getRepository(UserEntity);

    let find = await MessageRepository.findOneBy({
        userId: member.id
    });

    if (!find) {
        //@ts-expect-error
        find = await MessageRepository.save({
            userId: member.id,
            messages: 0
        }).catch(console.log);
    }

    MessageRepository.update({
        userId: member.id,
    }, {
        messages: find.messages + 1
    }).catch(console.log);

    const xp = await addXP(member, defaultMessageLevel);

    return {
        levels: xp,
        messages: find
    };
}

export async function addLeaderboardMessage(message: Message){
    const LeaderboardRepository = (await AppDataSource).getRepository(Leaderboards);

    const lbMessage = await LeaderboardRepository.save({
        messageId: message.id,
        guildId: message.guild.id
    }).catch(console.log);

    return lbMessage;
}

//calculates the xp to the next level up
export async function calculateXP() {
    return defaultMessageLevel;
}

export type LevelEvents = "levelUp";
export class LevelClient {
    on: (eventName: LevelEvents, listener: (...args: any[]) => void) => EventEmitter;
    emit: (eventName: LevelEvents, ...args: any[]) => void
}
export const client: LevelClient = new EventEmitter();
