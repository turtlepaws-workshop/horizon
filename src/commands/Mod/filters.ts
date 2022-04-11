import { channelMention, codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, MessageButton, MessageEmbed, ApplicationCommandAutocompleteOption, AutocompleteInteraction, ApplicationCommandOptionChoice, Channel, Message, TextChannel, MessageActionRow } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun, ErrorMessage } from "../../util/util";
import Command from "../../lib/command";
import HorizonSlashCommandBuilder from "../../lib/SlashCommandBuilder";
import { Modal, showModal, TextInputComponent } from "discord-modals";
import { v4 } from "uuid";
import EmbedData from "../../models/embed";
import { EmbedModel } from "../../typings/index";
import { website } from "../../config/config";
import { APIApplicationCommandAutocompleteResponse, ButtonStyle } from "discord-api-types";
import { createSettings } from "../../client/levels";
import embed from "../../models/embed";
import { parseStringMap } from "../../lib/stringmap";

export default class Invite extends Command {
    constructor() {
        const filters: [name: string, value: string][] = [
            ["Links", "LINK"],
            ["Bad Word", "BAD_WORD"],
            ["Discord Invite", "DISCORD_INVITE"],
            ["Redirects and Link shortners", "REDIRECT"]
        ];

        super({
            commandBuilder: new HorizonSlashCommandBuilder()
                .setName("filters")
                .setDescription("Update the guilds filter settings")
                .addSubcommandGroup(i => {
                    return i.setName("links")
                    .setDescription("Update the guilds link filter settings.")
                    .addSubcommand(e => 
                        e.setName("add")
                        .setDescription("Add a blacklisted link.")
                        .addStringOption(o => 
                            o.setName("link")
                            .setName("The link to add.")
                            .setRequired(true)
                        )
                    )
                    .addSubcommand(e => 
                        e.setName("remove")
                        .setDescription("Remove a blacklisted link")
                        .addStringOption(o => 
                            o.setName("link")
                            .setDescription("The link to remove.")
                            .setRequired(true)
                            .setAutocomplete(true)
                        )
                    )
                    .addSubcommand(e => 
                        e.setName("whitelist_add")
                        .setDescription("Whitelist a link")
                        .addStringOption(o =>
                            o.setName("link")
                            .setDescription("The link to action.")
                            .setRequired(true)
                        )

                    )
                    .addSubcommand(e => 
                        e.setName("whitelist_remove")
                        .setDescription("Remove a whitelisted link.")
                        .addStringOption(o =>
                            o.setName("link")
                            .setDescription("The link to action.")
                            .setRequired(true)
                            .setAutocomplete(true)
                        )
                    )
                })
                .addSubcommandGroup(i => {
                    return i.setName("words")
                    .setDescription("Update the guilds word filter settings.")
                    .addSubcommand(e => 
                        e.setName("add")
                        .setDescription("Add a blacklisted word.")
                        .addStringOption(o => 
                            o.setName("word")
                            .setName("The word to add.")
                            .setRequired(true)
                        )
                    )
                    .addSubcommand(e => 
                        e.setName("remove")
                        .setDescription("Remove a blacklisted word")
                        .addStringOption(o => 
                            o.setName("word")
                            .setDescription("The word to remove.")
                            .setRequired(true)
                            .setAutocomplete(true)
                        )
                    )
                    .addSubcommand(e => 
                        e.setName("whitelist_add")
                        .setDescription("Whitelist a word")
                        .addStringOption(o =>
                            o.setName("word")
                            .setDescription("The word to action.")
                            .setRequired(true)
                        )

                    )
                    .addSubcommand(e => 
                        e.setName("whitelist_remove")
                        .setDescription("Remove a whitelisted word.")
                        .addStringOption(o =>
                            o.setName("word")
                            .setDescription("The word to action.")
                            .setRequired(true)
                            .setAutocomplete(true)
                        )
                    )
                })
                .addSubcommand(s => 
                    s.setName("add")
                    .setDescription("Add a filter.") 
                    .addStringOption(o =>
                        o.setName("filter")
                        .setDescription("The filter you would like to add.")
                        .setChoices(filters)
                        .setRequired(true)
                    )
                )
                .addSubcommand(s => 
                    s.setName("remove")
                    .setDescription("Remove a filter.") 
                    .addStringOption(o =>
                        o.setName("filter")
                        .setDescription("The filter you would like to remove.")
                        .setChoices(filters)
                        .setRequired(true)
                    )
                ),
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: [
                "MANAGE_MESSAGES",
                "MANAGE_GUILD"
            ]
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        //Do stuff
    }
}