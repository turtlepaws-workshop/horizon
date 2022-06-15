import StringMap from "../lib/stringmap";
import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"

@Entity()
export class Utils {
    @PrimaryGeneratedColumn()
    requiredId: string;

    @Column()
    commandsRun: number;

    @Column()
    usersVerified: number;

    @Column()
    usersActioned: number;
}