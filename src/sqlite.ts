import "reflect-metadata"
import { DataSource, EntityTarget, Repository } from "typeorm"
import { CustomEmbed } from "./entities/embed"
import { Leaderboards } from "./entities/leaderboards"
import { User } from "./entities/user"
import { GuildSettings } from "./entities/settings"
import App from "next/app"
import { Utils } from "./entities/utils"
import { isVoid } from "./util/util"
import { GuildCases } from "./entities/cases"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: false,
    entities: [CustomEmbed, Leaderboards, User, GuildSettings, GuildCases],
    migrations: [],
    subscribers: [],
}).initialize();

export const UtilDB = new DataSource({
    type: "sqlite",
    database: "utils.sqlite",
    synchronize: true,
    logging: false,
    entities: [Utils],
    migrations: [],
    subscribers: [],
}).initialize();

export async function getUtils() {
    return (await UtilDB);
}

export class UtilDBManager {
    public db: DataSource;
    public repository: Repository<Utils>;

    constructor(){
        this.init();
    }

    private async init(){
        this.db = await getUtils();
        this.repository = this.db.getRepository(Utils);

        const check = await this.repository.find();

        if(check.length == 0){
            await this.create();
        }
    }

    private async create(){
        this.repository.save({
            commandsRun: 0,
            usersActioned: 0,
            usersVerified: 0            
        });
    }

    private async update(options: {
        usersVerified?: number;
        usersActioned?: number;
        commandsRun?: number;
    }){
        const check = await this.repository.find();
        const fetch = check[0];

        if(check.length == 0){
            await this.create();
        }

        await this.repository.update(
            check[0].requiredId,
            {
                commandsRun: isVoid(options.commandsRun) ? fetch.commandsRun : options.commandsRun,
                usersActioned: isVoid(options.usersActioned) ? fetch.usersActioned : options.usersActioned,
                usersVerified: isVoid(options.usersVerified) ? fetch.usersVerified : options.usersVerified
            }
        );

        return check[0];
    }

    private async fetch(){
        const check = await this.repository.find();

        return check[0];
    }

    public async addCommand(){
        const fetch = await this.fetch();

        await this.update({
            commandsRun: fetch.commandsRun + 1
        });
    }

    public async addVerifedUser(){
        const fetch = await this.fetch();

        await this.update({
            usersVerified: fetch.usersVerified + 1
        });
    }

    public async addActionedUser(){
        const fetch = await this.fetch();

        await this.update({
            usersActioned: fetch.usersActioned + 1
        });
    }
}