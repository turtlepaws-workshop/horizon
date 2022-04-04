import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"

@Entity()
export class Leaderboards {
    @PrimaryColumn()
    guildId: string

    @Column()
    messageId: string

    @Column()
    channelId: string
}