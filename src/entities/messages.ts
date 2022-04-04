import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"

@Entity()
export class UserMessages {
    @PrimaryColumn()
    userId: string

    @Column()
    messages: number
}