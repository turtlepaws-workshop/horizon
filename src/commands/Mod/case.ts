import { channelMention, codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, ButtonBuilder as MessageButton, EmbedBuilder as MessageEmbed, ApplicationCommandAutocompleteOption, AutocompleteInteraction, Channel, Message, TextChannel, ActionRowBuilder as MessageActionRow, ChatInputCommandInteraction, User, Guild } from "discord.js";
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
import AutocompleteHelper, { handleAutocomplete, voidAutocomplete } from "../../lib/autocomplete";
import { fetchSettings } from "../../lib/extends";
import { createArrayBindingPattern, GenericType, idText, Map } from "typescript";
import { DataSource, Repository } from "typeorm";
import { Case, GuildCases } from "../../entities/cases";
import { AppDataSource } from "../../sqlite";
import { advancedId } from "../../lib/ID";
import { get } from "../../text/manager";

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
                .setName("case")
                .setDescription("Guild Moderation Case Management")
                .addSubcommand(s =>
                    s.setName("create")
                        .setDescription("Create a case.") //User will not be banned, kicked, or any other moderation action (use ban or kick command to action & create a case)")
                        .addUserOption(e => e.setName("user").setDescription("The user that will be actioned.").setRequired(true))
                        .addStringOption(e => e.setName("reason").setDescription("The reason for the case."))
                )
                .addSubcommand(s =>
                    s.setName("update")
                        .setDescription("Update a case. You can only update the reason.")
                        .addStringOption(e =>
                            e.setName("case").setDescription("The case to update.")
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                        .addStringOption(e => e.setName("reason").setDescription("The reason for the case.").setRequired(true))
                )
                .addSubcommand(s =>
                    s.setName("delete")
                        .setDescription("Delete a case from a user.")
                        .addStringOption(e =>
                            e.setName("case").setDescription("The case to update.")
                                .setRequired(true)
                                .setAutocomplete(true)
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

    async repository(): Promise<Repository<GuildCases>> {
        return (await AppDataSource).getRepository(GuildCases);
    }

    async autocomplete(interaction: AutocompleteInteraction<CacheType>): Promise<void> {
        const dclient = interaction.client;
        const cases = await (await this.repository()).findOneBy({
            guildId: interaction.guild.id
        });

        if (!cases) {
            return voidAutocomplete(interaction);
        }

        //@ts-expect-error
        const guildCases: Case[] = parseStringMap(cases.cases, "MAP").values();

        await handleAutocomplete(
            interaction,
            guildCases.map(c => ({
                name: c.id,
                value: `${dclient.users.cache.get(c.userId).tag} (${c.reason || "No reason provided."})`
            }))
        );
    }

    async execute(interaction: ChatInputCommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        const subcommand = interaction.options.getSubcommand();
        const manager = new CaseManager();
        await manager.setup();

        async function check(Id: string){
            return await manager.hasCase({
                guild: interaction.guild,
                caseId: Id
            });
        }
        
        if (subcommand == "create") {
            manager.createCase({
                user: interaction.options.getUser("user"),
                reason: interaction.options.getString("reason"),
                guild: interaction.guild
            });

            await interaction.reply({
                content: await get("CaseCreate", interaction)
            });
        } else if (subcommand == "update") {
            const exists = await check(interaction.options.getString("case"));

            if(!exists) {
                return ErrorMessage(
                    "Case not found.",
                    interaction
                );
            }

            manager.updateCase({
                caseId: interaction.options.getString("case"),
                reason: interaction.options.getString("reason"),
                guild: interaction.guild
            });

            await interaction.reply({
                content: await get("CaseUpdate", interaction)
            });
        } else if (subcommand == "delete") {
            const exists = await check(interaction.options.getString("case"));

            if(!exists) {
                return ErrorMessage(
                    "Case not found.",
                    interaction
                );
            }

            manager.deleteCase({
                caseId: interaction.options.getString("case"),
                guild: interaction.guild
            });

            await interaction.reply({
                content: await get("CaseDelete", interaction)
            });
        }
        
        //...
    }
}

export class CaseManager {
    public repository: Repository<GuildCases>;
    public database: DataSource;

    async setup() {
        this.database = (await AppDataSource);
        this.repository = this.database.getRepository(GuildCases);
    }

    private async create(guild: Guild) {
        await this.repository.save({
            cases: "",
            guildId: guild.id
        });
    }

    private async fetch(guild: Guild): Promise<{ cases: StringMap<string, Case>; guildId: string; }> {
        const find = await this.repository.findOneBy({
            guildId: guild.id
        });

        if(!find){
            return {
                cases: new StringMap<string, Case>(),
                guildId: guild.id
            }
        }

        return {
            //@ts-expect-error
            cases: parseStringMap(find.cases, "STRING_MAP"),
            guildId: find.guildId
        };
    }

    private async update(options: {
        guild: Guild,
        //Cases should be the new cases not old & new
        //Old cases will be inserted automatically
        cases: StringMap<string, Case>
    }) {
        //Fetch the old cases
        const fetch = await this.fetch(options.guild);
        //Check if there's a entity for this guild
        if(!fetch){
            await this.create(options.guild);
        }
        //Create a new string map
        const sm = new StringMap<string, Case>();
        //Add options.cases to the new string map
        options.cases.keysAndValues().forEach(obj => {
            sm.set(obj.key, obj.value);
        });
        //Check if theres an old string map to merge with
        if (fetch.cases.size != 0) {
            //Merge the new string map with the old one
            fetch.cases.keysAndValues().forEach(obj => {
                sm.set(obj.key, obj.value);
            });
        }

        await this.repository.update(fetch.guildId, {
            cases: sm.toString()
        });
    }

    //This is built for deleting cases
    private async reverseUpdate(options: {
        guild: Guild,
        cases: (oldCases: StringMap<string, Case>) => StringMap<string, Case>
    }) {
        //Fetch the old cases
        const fetch = await this.fetch(options.guild);
        const result = options.cases(fetch.cases);

        await this.repository.update(fetch.guildId, {
            cases: result.toString()
        });
    }

    async hasCase(options: {
        guild: Guild,
        caseId: string
    }){
        const fetch = await this.fetch(options.guild);

        return fetch.cases.exists(options.caseId);
    }

    async updateCase(options: {
        guild: Guild,
        caseId: string,
        reason: string
    }){
        const fetch = await this.fetch(options.guild);

        this.reverseUpdate({
            guild: options.guild,
            cases: (oldCases) => {
                const selectedCase = oldCases.get(options.caseId);
                oldCases.remove(options.caseId)
                oldCases.set(selectedCase.id, {
                    reason: options.reason,
                    userId: selectedCase.userId,
                    id: selectedCase.id,
                    createdAt: selectedCase.createdAt,
                    updatedAt: Date.now()
                });
                return oldCases;
            }
        });
    }

    async createCase(options: {
        user: User;
        reason: string;
        guild: Guild;
    }) {
        const guildCases = await this.fetch(options.guild);
        const customId = advancedId(
            guildCases.cases.values().map(e => e.id)
        );

        this.update({
            guild: options.guild,
            cases: new StringMap<string, Case>()
            .set(customId, {
                id: customId,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                userId: options.user.id,
                reason: options.reason || null
            })
        });
    }

    async deleteCase(options: {
        guild: Guild;
        caseId: string;
    }){
        const { caseId, guild } = options;
        const guildCases = await this.fetch(guild);

        this.reverseUpdate({
            guild: guild,
            cases: (cases) => {
                cases.remove(caseId)
                return cases;
            }
        });
    }
}