import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "@discordjs/builders";
import { ApplicationCommandAutocompleteOption, AutocompleteInteraction, Client, CommandInteraction, PermissionString } from "discord.js";
import { CommandOptions } from "../typings";
import SlashCommandOptionBuilder from "./optionBuilder";

export default class Command {
    public name: string;
    public description: string;
    public requiredPermissions!: PermissionString[];
    public somePermissions!: PermissionString[];
    public runPermissions!: PermissionString[];
    public builder!: SlashCommandBuilder;
    public dev: boolean = false;

    constructor(options: CommandOptions, optionBuilder: SlashCommandOptionBuilder = new SlashCommandOptionBuilder()){
        //Set permissions
        this.requiredPermissions = options.requiredPermissions;
        this.runPermissions = options.runPermissions;
        this.somePermissions = options.somePermissions;

        //Set base data
        this.name = options.name;
        this.description = options.description;
        this.dev = options.dev;
        
        this.builder = optionBuilder.builder.setName(options.name)
        .setDescription(options.description);
    }

    builderJSON(){
        return this.builder.toJSON();
    }

    async execute(
        interaction: CommandInteraction,
        client: Client
    ): Promise<void> { }

    async autocomplete(
        interaction: AutocompleteInteraction,
        client: Client
    ): Promise<string[]|ApplicationCommandAutocompleteOption[]> {
        return [];
    }

    
}