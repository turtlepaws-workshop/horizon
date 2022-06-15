import { Client, ContextMenuCommandInteraction as ContextMenuInteraction, PermissionsString } from "discord.js";
import { ContextMenuBuilder } from "discord.js-util";
import { MenuOptions, PermissionString } from "../typings";

export default class Menu {
    public name: string;
    public dev: boolean;
    public runPermissions: PermissionsString[];
    public requiredPermissions: PermissionString[];
    public somePermissions: PermissionString[];
    public builder: ContextMenuBuilder = new ContextMenuBuilder();

    constructor(options: MenuOptions){
        this.builder = this.builder.setName(options.name)
        .setType(options.type);

        this.name = options.name;
        this.dev = options.dev;
        this.requiredPermissions = options.requiredPermissions;
        this.runPermissions = options.runPermissions;
        this.somePermissions = options.somePermissions;
    }

    async execute(
        interaction: ContextMenuInteraction,
        client: Client
    ): Promise<void> { }
}