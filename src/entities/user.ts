import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"

@Entity()
export class User {
    @PrimaryColumn()
    guildId: string

    @Column()
    userId: string

    @Column()
    messages: number

    @Column()
    birthday: number
}