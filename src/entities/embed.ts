import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"

@Entity()
export class CustomEmbed {
    @PrimaryColumn()
    customId: string

    @Column()
    userId: string

    @Column()
    embedData: string //json.string()
}