import { channelMention, codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, ButtonBuilder as MessageButton, EmbedBuilder as MessageEmbed, ApplicationCommandAutocompleteOption, AutocompleteInteraction, Channel, Message, TextChannel, ActionRowBuilder as MessageActionRow, ChatInputCommandInteraction } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun, ErrorMessage } from "../../util/util";
import Command from "../../lib/command";
import HorizonSlashCommandBuilder from "../../lib/SlashCommandBuilder";
import { Modal, showModal, TextInputComponent } from "discord-modals";
import { v4 } from "uuid";
import EmbedData from "../../models/embed";
import { EmbedModel } from "../../typings/index";
import { website } from "../../config/config";
import { changeSettings, client, createSettings } from "../../client/levels";
import embed from "../../models/embed";
import StringMap, { parseStringMap } from "../../lib/stringmap";
import { APIApplicationCommandOptionChoice } from "discord-api-types/v9";
import { handleAutocomplete } from "../../lib/autocomplete";
import { fetchSettings } from "../../lib/extends";
import { createArrayBindingPattern, GenericType, Map } from "typescript";

/////////
//TYPES//
/////////

enum Subcommand {
    LinkAdd = "add",
    LinkRemove = "remove",
    LinkWhitelistAdd = "whitelist_add",
    LinkWhitelistRemove = "whitelist_remove",
    WordAdd = "add",
    WordRemove = "remove",
}
enum SubcommandGroup {
    Words = "words",
    Links = "links",
    FilterRemove = "remove",
    FilterAdd = "add"
}

export default class Invite extends Command {
    constructor() {
        const filters: APIApplicationCommandOptionChoice<string>[] = [
            {
                name: "Links",
                value: "LINK"
            },
            {
                name: "Bad Word",
                value: "BAD_WORD"
            },
            {
                name: "Discord Invite",
                value: "DISCORD_INVITE"
            },
            {
                name: "Redirects and Link shortners",
                value: "REDIRECT"
            }
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
                                        .setDescription("The link to add.")
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
                                        .setDescription("The word to add.")
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
                })
                .addSubcommand(s =>
                    s.setName("add")
                        .setDescription("Add a filter.")
                        .addStringOption(o =>
                            o.setName("filter")
                                .setDescription("The filter you would like to add.")
                                .setChoices(...filters)
                                .setRequired(true)
                        )
                )
                .addSubcommand(s =>
                    s.setName("remove")
                        .setDescription("Remove a filter.")
                        .addStringOption(o =>
                            o.setName("filter")
                                .setDescription("The filter you would like to remove.")
                                .setChoices(...filters)
                                .setRequired(true)
                        )
                ),
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: [
                "ManageMessages",
                "ManageGuild"
            ]
        });
    }

    async autocomplete(interaction: AutocompleteInteraction<CacheType>): Promise<void> {
        const presets = {
            Words: {
                SubcommandGroup: SubcommandGroup.Words,
                Subcommands: [
                    Subcommand.WordAdd,
                    Subcommand.WordRemove
                ]
            },
            Links: {
                SubcommandGroup: SubcommandGroup.Links,
                Subcommands: [
                    Subcommand.LinkAdd,
                    Subcommand.LinkRemove,
                    Subcommand.LinkWhitelistAdd,
                    Subcommand.LinkWhitelistRemove
                ]
            }
        }
        const sc = interaction.options.getSubcommandGroup();
        const s = interaction.options.getSubcommand();

        const guildSettings = await fetchSettings(interaction.guild.id);
        
        function parseString(s: any): globalThis.Map<string, string> {
            //@ts-expect-error
            return parseStringMap(s, "MAP");
        }

        if (sc == SubcommandGroup.Words){
            if(s == Subcommand.WordRemove){
                const bannedWords: string[] = Array.from(
                    parseString(guildSettings.automod_bannedWords).values()
                );
                await handleAutocomplete(interaction, bannedWords);
            }
        } else if (sc == SubcommandGroup.Links) {
            if(s == Subcommand.LinkRemove){
                await handleAutocomplete(
                    interaction,
                    Array.from(
                        parseString(guildSettings.automod_links).values()
                    )
                )
            } else if(s == Subcommand.LinkWhitelistRemove){
                await handleAutocomplete(
                    interaction,
                    Array.from(
                        parseString(guildSettings.automod_links_whitelist).values()
                    )
                )
            }
        }
    }

    async execute(interaction: ChatInputCommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        const settings = await fetchSettings(interaction.guild.id);
        const subcommand = interaction.options.getSubcommand();
        function hasEnum(str: string, an_enum: any): boolean {
            return Object.values(an_enum).includes(str);
        }
        function is(option: Subcommand | SubcommandGroup){
            console.log(option,
                option == interaction.options.getSubcommandGroup(),
                interaction.options.getSubcommand()
            )
            if(option in SubcommandGroup || hasEnum(option, SubcommandGroup)){
                return option == interaction.options.getSubcommandGroup();
            } else if(option in Subcommand || hasEnum(option, Subcommand)){
                return option == interaction.options.getSubcommand();
            }
        }

        /*
        Change Guild settings base:

        changeSettings(interaction.guild.id, async (settings, filter, isNull) => {
            //...
        });
        */

        function strMap(str: string, objectsToAdd: { key: string, value: string }[]): StringMap<string, string> {
            if(str == ""){
                const r = new StringMap<string, string>();
                objectsToAdd.forEach(o => r.set(o.key, o.value));
                return r;
            }

            //@ts-expect-error
            const stringmap: StringMap<string, string> = parseStringMap(str, "STRING_MAP")

            const r = new StringMap<string, string>();
            stringmap.keysAndValues().forEach(o => r.set(o.key, o.value));
            objectsToAdd.forEach(o => r.set(o.key, o.value));
            return r;
        }

        function strRmvMap(str: string, keysToRemove: string[]): StringMap<string, string> {
            if(str == ""){
                return new StringMap<string, string>();
            }

            //@ts-expect-error
            const stringmap: StringMap<string, string> = parseStringMap(str, "STRING_MAP")

            const r = new StringMap<string, string>();
            stringmap.keysAndValues().forEach(o => r.set(o.key, o.value));
            keysToRemove.forEach(o => r.remove(o));
            return r;
        }

        function generateReply(isRemoved: boolean, item: string, a: string = "a", itemname: string = "item"){
            return `${client.customEmojis.get("fe_checked")} Successfully ${isRemoved ? "removed" : "added"} ${a} ${item} ${itemname}.`;
        }
        
        async function sendReply(content: string, ephemeral: boolean = true){
            await interaction.reply({
                content,
                ephemeral
            });
        }

        if(is(SubcommandGroup.Links)){
            if(is(Subcommand.LinkAdd)){
                await changeSettings(interaction.guild.id, async (settings, repo, filter, isNull, next) => {
                    settings.automod_links = strMap(
                        settings.automod_links,
                        [
                            {
                                key: interaction.options.getString("link"),
                                value: interaction.options.getString("link")
                            }
                        ]
                    ).toString()


                    next(settings);
                });

                await sendReply(
                    generateReply(false, "link")
                );
            } else if(is(Subcommand.LinkRemove)){
                await changeSettings(interaction.guild.id, async (settings, repo, filter, isNull, next) => {
                    settings.automod_links = strRmvMap(
                        settings.automod_links,
                        [
                            interaction.options.getString("link")
                        ]
                    ).toString();

                    next(settings);
                });

                await sendReply(
                    generateReply(true, "link")
                );
            } else if(is(Subcommand.LinkWhitelistAdd)){
                await changeSettings(interaction.guild.id, async (settings, repo, filter, isNull, next) => {
                    settings.automod_links_whitelist = strMap(
                        settings.automod_links_whitelist,
                        [
                            {
                                key: interaction.options.getString("link"),
                                value: interaction.options.getString("link")
                            }
                        ]
                    ).toString();

                    next(settings);
                });

                await sendReply(
                    generateReply(false, "whitelist link")
                );
            } else if(is(Subcommand.LinkWhitelistRemove)){
                await changeSettings(interaction.guild.id, async (settings, repo, filter, isNull, next) => {
                    settings.automod_links_whitelist = strRmvMap(
                        settings.automod_links_whitelist,
                        [
                            interaction.options.getString("link")
                        ]
                    ).toString();

                    next(settings);
                });

                await sendReply(
                    generateReply(true, "whitelist link")
                );
            }
        } else if(is(SubcommandGroup.Words)){
            if(is(Subcommand.WordAdd)){
                await changeSettings(interaction.guild.id, async (settings, repo, filter, isNull, next) => {
                    settings.automod_bannedWords = strMap(
                        settings.automod_bannedWords,
                        [
                            {
                                key: interaction.options.getString("word"),
                                value: interaction.options.getString("word")
                            }
                        ]
                    ).toString();

                    next(settings);
                });

                await sendReply(
                    generateReply(false, "word")
                );
            } else if(is(Subcommand.WordRemove)){
                await changeSettings(interaction.guild.id, async (settings, repo, filter, isNull, next) => {
                    settings.automod_bannedWords = strRmvMap(
                        settings.automod_bannedWords,
                        [
                            interaction.options.getString("word")
                        ]
                    ).toString();

                    next(settings);
                });

                await sendReply(
                    generateReply(true, "word")
                );
            }
        }
    }
}