import { Client } from "discord.js";
import { DiscordClientEvents, EventOptions } from "../typings";

export default class Event {
    public event: DiscordClientEvents;
    public once: boolean = false;

    constructor(options: EventOptions){
        this.event = options.event;
        if(options.once != undefined) this.once = options.once;
    }

    async execute(
        client: Client,
        ...args: any[]
    ): Promise<void> { }
}