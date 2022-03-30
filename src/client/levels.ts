import { Client, GuildMember, MessageAttachment, User } from "discord.js";
import XPLevels from "discord-xp-typescript";
import { mongoDB } from "../config/secrets.json";
import { MessageModel, Model } from ".././models/messages";
export const defaultMessageLevel = 50;
import { EventEmitter } from "events";
import { Rank } from "canvacord";

//https://www.npmjs.com/package/discord-xp
export default async function initLevels(client: Client) {
    XPLevels.setURL(mongoDB);
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

export async function generateRankCard(member: GuildMember) {
    const xpUser = await XPLevels.fetch(member.id, member.guild.id);
    const leaderboard = await XPLevels.fetchLeaderboard(member.guild.id, 100);
    //@ts-expect-error
    const rank: string = (leaderboard.findIndex(e => e.userID == member.user.id)+1);

    if(!xpUser) return false;
    
    const rankCard = await new Rank()
        .setAvatar(member.displayAvatarURL({
            format: "jpg"
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

    return new MessageAttachment(rankCard, "Rank.png");
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
    //@ts-expect-error
    let find: MessageModel = await Model.findOne({
        userId: member.id
    });

    if (!find) {
        //@ts-expect-error
        find = await new Model({
            userId: member.id,
            messages: 0
        }).save().catch(console.log);
    }

    find.messages += 1;
    await find.save().catch(console.log);
    const xp = await addXP(member, defaultMessageLevel);

    return {
        levels: xp,
        messages: find
    };
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