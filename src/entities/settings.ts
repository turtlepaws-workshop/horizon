import { HexColorString } from 'discord.js';
import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"

@Entity()
export class GuildSettings {
    ////////////
    //GUILD ID//
    ////////////
    @PrimaryColumn()
    guildId: string

    //////////////////
    //LEVEL SETTINGS//
    //////////////////
    @Column()
    levels_enabled: boolean
    @Column()
    levels_messageChannel: string | null
    @Column()
    levels_message: string
    @Column()
    levels_embed: boolean
    @Column()
    levels_cardBackgroundURL: string
    @Column()
    levels_cardProgressBar: HexColorString    
    
    ///////////
    //AUTOMOD//
    ///////////
    @Column()
    automod_enabled: boolean
    @Column()
    automod_bannedWords: string
    @Column()
    automod_filters: string //StringMap<>
    @Column()
    automod_links: string
    @Column()
    automod_links_whitelist: string

    /////////
    //LOGS//
    ////////
    @Column()
    logs_enabled: boolean
    @Column()
    logs_channel: string | null //Null means it's disabled

    /////////////
    //STARBOARD//
    /////////////
    @Column()
    starboard_enabled: boolean
    @Column()
    starboard_channel: string | null //Null means it's disabled

    ///////////////////////
    //BASE GUILD SETTINGS//
    ///////////////////////
    @Column()
    guild_modCommands: boolean
}