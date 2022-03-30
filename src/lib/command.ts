import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "@discordjs/builders";
import { ApplicationCommandAutocompleteOption, AutocompleteInteraction, Client, CommandInteraction, PermissionString } from "discord.js";
import { CommandOptions } from "../typings";
import SlashCommandOptionBuilder from "./optionBuilder";
import SignalSlashCommandBuilder from "./SlashCommandBuilder";

export default class Command {
    public name: string;
    public description: string;
    public requiredPermissions!: PermissionString[];
    public somePermissions!: PermissionString[];
    public runPermissions!: PermissionString[];
    public builder!: SignalSlashCommandBuilder;
    public dev: boolean = false;
    public serverOnly: boolean = true;

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