import StringMap from "../lib/stringmap";
import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"

export interface Case {
    userId: string;
    reason?: string;
    createdAt: number;
    updatedAt: number;
    id: string;
}

export type CaseMap = StringMap<string, Case>;

@Entity()
export class GuildCases {
    @PrimaryColumn()
    guildId: string

    @Column()
    cases: string //StringMap<string: "ID", Case>
}