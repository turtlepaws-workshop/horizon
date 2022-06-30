import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "@discordjs/builders";
import { ApplicationCommandAutocompleteOption, AutocompleteInteraction, Client, CommandInteraction, PermissionsString } from "discord.js";
import { Categories } from "src/typings/types";
import { CommandOptions, PermissionString } from "../typings";
import SlashCommandOptionBuilder from "./optionBuilder";
import HorizonSlashCommandBuilder from "./SlashCommandBuilder";

export default class Command {
    public name: string;
    public description: string;
    public requiredPermissions!: PermissionString[];
    public somePermissions!: PermissionString[];
    public runPermissions!: PermissionsString[];
    public builder!: HorizonSlashCommandBuilder;
    public dev: boolean = false;
    public serverOnly: boolean = true;
    public category: Categories;

    constructor(options: CommandOptions){
        //Set permissions
        this.requiredPermissions = options.requiredPermissions;
        this.runPermissions = options.runPermissions;
        this.somePermissions = options.somePermissions;

        //Set base data
        const builder = options.commandBuilder.builder;
        this.serverOnly = options.serverOnly || true;
        this.builder = options.commandBuilder;
        this.name = builder.name;
        this.description = builder.description;
        this.dev = options.dev || false;
        this.category = options.category;
    }

    builderJSON(){
        return this.builder.builder.toJSON();
    }

    async execute(
        interaction: CommandInteraction,
        client: Client
    ): Promise<void> { }

    async autocomplete(
        interaction: AutocompleteInteraction,
        client: Client
    ): Promise<void> { }
}