import { Client, Guild, GuildMember, Message, MessageAttachment, User } from "discord.js";
import XPLevels from "discord-xp-typescript";
import { mongoDB } from "../config/secrets.json";
import { MessageModel, Model } from ".././models/messages";
export const defaultMessageLevel = 50;
import { EventEmitter } from "events";
import { Rank } from "canvacord";
import * as Canvas from "canvas";
import { LbModel, LeaderboardsModel } from ".././models/leaderboards";

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

export async function generateLeaderboard(guild: Guild){
    //Fetch leaderboard
    const rawLeaderboard = await XPLevels.fetchLeaderboard(guild.id, 10);
    const users = await XPLevels.computeLeaderboard(guild.client, rawLeaderboard, true);
    
    //Return if there's no leaderboard
    if(!users) return false;

    //Load all files
    const backgroundFile = "./src/Images/background.png";
    const backgroundFileAvatar = "./src/Images/avatar_background.png";
    const backgroundAvatar = await Canvas.loadImage(backgroundFileAvatar);
    const background = await Canvas.loadImage(backgroundFile);

    //Apply text function from https://discordjs.guide/
    const applyText = (canvas, text) => {
        const context = canvas.getContext('2d');
        let fontSize = 70;

        do {
            context.font = `${fontSize -= 10}px sans-serif`;
        } while (context.measureText(text).width > canvas.width - 300);

        return context.font;
    };
    
    //Create canvas
    const canvas = Canvas.createCanvas(700, 1250);
    const context = canvas.getContext('2d');

    //Draw background
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    //I have no idea what this is...
    // context.strokeStyle = '#0099ff';
    // context.strokeRect(0, 0, canvas.width, canvas.height);
    //...

    //These are the positions of where the avatars or names should go
    const poses = {
        0: { text: 91, avatar: 25.7 },
        1: { text: 341, avatar: 275.7 },
        2: { text: 591, avatar: 525.7 },
        3: { text: 841, avatar: 775.7 },
        4: { text: 1091, avatar: 1025.7 },
        "defualt": { avatar: { x: 24.2, w: 199.9, h: 198.7 }, text: { x: 260.6, w: 380.2, h: 68 } }
    }
    //This is the current position that its drawing on
    let pos = 0;
    //Run a for loop for all the users of the leaderboard
    for (const user of users) {
        //Fetch the user using discord.js
        const dUser = await guild.client.users.fetch(user.userID);
        //Fetch the member object too
        const dMember = await guild.members.fetch(user.userID);

        //Get the position that its drawing
        const posData = poses[pos];

        //Paint their nickname, username, or no name
        const availbleUsername = dMember != null ? (dMember?.nickname || user?.username) : "Unknown user";

        //Add their username or nickname
        context.font = applyText(canvas, `${availbleUsername}`);
        //Select the text color
        context.fillStyle = '#ffffff';
        //Paint it on
        context.fillText(`${availbleUsername}`, poses.defualt.text.x, posData.text);

        //Load the avatar. If the user does not exist use a discord one
        const avatar = await Canvas.loadImage(dMember == null ? "https://cdn.discordapp.com/embed/avatars/0.png" : dMember.displayAvatarURL({ format: 'png' }));

        //Draw the avatar
        context.save()
        context.beginPath();
        context.arc(poses.defualt.avatar.x + 100, posData.avatar + 100, 100, 0, Math.PI * 2, true)
        context.closePath()
        context.clip()
        context.drawImage(backgroundAvatar, poses.defualt.avatar.x, posData.avatar, poses.defualt.avatar.w, poses.defualt.avatar.h);
        context.drawImage(avatar, poses.defualt.avatar.x, posData.avatar, poses.defualt.avatar.w, poses.defualt.avatar.h);
        context.restore()
        //...

        //Move to the next position
        pos++
    }

    //Return the image as a MessageAttachment
    return new MessageAttachment(canvas.toBuffer(), 'leaderboard.png');
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

export async function addLeaderboardMessage(message: Message){
    //@ts-expect-error
    const lbMessage: LeaderboardsModel = await new LbModel({
        messageId: message.id,
        guildId: message.guild.id
    }).save().catch(console.log);

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
