import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "@discordjs/builders";
import { ApplicationCommandAutocompleteOption, AutocompleteInteraction, Client, CommandInteraction, PermissionString } from "discord.js";
import { CommandOptions } from "../typings";

export default class Command {
    public name: string;
    public description: string;
    public requiredPermissions!: PermissionString[];
    public runPermissions!: PermissionString[];
    public builder!: SlashCommandBuilder;
    public dev: boolean = false;

    constructor(options: CommandOptions, optionBuilder: SlashCommandBuilder = new SlashCommandBuilder()){
        this.name = options.name;
        this.description = options.description;
        this.dev = options.dev;
        this.builder = optionBuilder.setName(options.name)
        .setDescription(options.description);
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