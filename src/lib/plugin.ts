import { Client } from "discord.js";
import { PluginOptions, PluginFiles, AnyBuilder, Builders } from "../typings";

export class Plugin {
    public name: string;
    public files: PluginFiles;
    public builders: Builders;
    public start: (client: Client) => Promise<void>;

    constructor(options: PluginOptions){
        this.name = options.name;
        this.builders = {
            menus: options.contextMenus,
            commands: options.commands
        };
        this.files = options.files;
        this.start = options.start;
    }
}