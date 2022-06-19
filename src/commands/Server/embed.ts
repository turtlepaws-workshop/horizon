import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, ModalBuilder, CacheType, Client, ButtonBuilder as MessageButton, EmbedBuilder as MessageEmbed, ApplicationCommandAutocompleteOption, AutocompleteInteraction, ApplicationCommandOptionType as ApplicationCommandOptionChoice, Channel, Message, ButtonStyle, ApplicationCommandOptionChoiceData, TextInputBuilder, TextInputStyle } from "discord.js";
import { Embed } from "../../util/embed";
import { actionRow, calculatePermissionForRun, ErrorMessage } from "../../util/util";
import Command from "../../lib/command";
import HorizonSlashCommandBuilder from "../../lib/SlashCommandBuilder";
import { Modal, showModal, TextInputComponent } from "discord-modals";
import { v4 } from "uuid";
import EmbedData from "../../models/embed";
import { EmbedModel } from "../../typings/index";
import { CustomEmbed } from "../../entities/embed"
import { website } from "../../config/config";
import { AppDataSource } from "../../sqlite";
import { parseEmbed } from "../../client/parse";

async function fetchRepository() {
    return (await AppDataSource).getRepository(CustomEmbed);    
}

export default class Invite extends Command {
    constructor() {
        super({
            commandBuilder: new HorizonSlashCommandBuilder()
                .setName("embed")
                .setDescription("Create an embed for button roles and more!")
                .addSubcommand(s => {
                    return s.setName("create")
                    .setDescription("Create a custom embed.");
                })
                .addSubcommand(s => {
                    return s.setName("send")
                    .setDescription(`Send one of your custom embeds!`)
                    .addStringOption(o => {
                        return o.setName("customid")
                        .setDescription("The custom Id of your embed.")
                        .setAutocomplete(true)
                        .setRequired(true)
                    })
                    .addChannelOption(o => {
                        return o.setName("channel")
                        .setDescription("The channel to send the embed in.");
                    })
                    .addStringOption(o => {
                        return o.setName("webhookurl")
                        .setDescription("Your custom webhook url.")
                    })
                }),
            requiredPermissions: [],
            runPermissions: [
                "SendMessages"
            ],
            somePermissions: [
                "ManageGuild",
                "ManageMessages",
                "ManageChannels"
            ]
        });
    }

    async autocomplete(interaction: AutocompleteInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        const repository = await fetchRepository();

        const data = Array.from(await repository.findBy({
            userId: interaction.user.id
        }));

        const focus = interaction.options.getFocused().toString();
        const respond: ApplicationCommandOptionChoiceData[] = [];

        for(const embed of data.filter(embed => {
            const ebd = parseEmbed(embed);
            const point = (ebd.data.title || ebd.data.author.name || ebd.data.footer.text || embed.customId);
            
            return (point.startsWith(focus) || point.endsWith(focus));
        })){
            const ebd = parseEmbed(embed);
            respond.push({
                name: (ebd.data.title || ebd.data.author.name || ebd.data.footer.text || "No data to provide.") + ` (${embed.customId})`,
                value: embed.customId
            });
        }

        await interaction.respond(respond);
    }

    async execute(interaction: ChatInputCommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        const subcommand = interaction.options.getSubcommand();
        const repo = await fetchRepository();

        if(subcommand == "create"){
            const modalCustomId = v4() + "modal";
            let fieldIds = {};
    
            function customId(val) {
                const Id = v4() + val
                fieldIds[val] = Id;
                return Id
            };
    
            const fields: {
                name: string,
                customId: string,
                type: TextInputStyle,
                max?: number,
                min?: number,
                req?: boolean
            }[] = [
                    {
                        customId: customId("title"),
                        name: "Title",
                        type: TextInputStyle.Short,
                        max: 256
                    },
                    {
                        name: "Description",
                        customId: customId("description"),
                        max: 4000,
                        type: TextInputStyle.Paragraph
                    },
                    {
                        name: "Author",
                        customId: customId("author_name"),
                        max: 256,
                        type: TextInputStyle.Short
                    },
                    {
                        name: "Footer",
                        customId: customId("footer_name"),
                        max: 2048,
                        type: TextInputStyle.Short
                    }
                ]
    
            const modal = new ModalBuilder()
                .setCustomId(modalCustomId)
                .setTitle("Embed Creator");
    
            const components = [];
            fields.forEach(f => {
                components.push(
                    new TextInputBuilder()
                        .setCustomId(f.customId)
                        .setLabel(f.name)
                        .setMaxLength(f.max)
                        .setStyle(f.type)
                        .setRequired(f.req || false)
                );
            });
            
            modal.addComponents([
                actionRow<TextInputBuilder>(components)
            ])
            
            await interaction.showModal(modal);
    
            const Modal = await interaction.awaitModalSubmit({ time: 0 }).then(async m => {
                if(m.customId != modalCustomId) return;

                const data = {
                    customId: v4(),
                    data: new MessageEmbed()
                        .setColor("Blurple")
                        //@ts-expect-error
                        .setTitle(m.fields.getTextInputValue(fieldIds.title))
                        //@ts-expect-error
                        .setDescription(m.fields.getTextInputValue(fieldIds.description))
                        .setURL(website)
                        .setAuthor({
                            //@ts-expect-error
                            name: m.fields.getTextInputValue(fieldIds.author_name),
                            url: website
                        })
                        .setFooter({
                            //@ts-expect-error
                            text: m.fields.getTextInputValue(fieldIds.footer_name)
                        }),
                    userId: interaction.user.id
                }
    
                await repo.save(data);
    
                await m.reply({
                    embeds: [
                        new Embed()
                            .setTitle(`${client.customEmojis.get("check_")} Created`)
                            .setDescription(`The embed has been created!`)
                            .addField(`${client.customEmojis.get("channel")} Custom Id`, `\`${data.customId}\``),
                        data.data
                    ]
                });
            });
        } else if(subcommand == "send"){
            const webhookURL = interaction.options.getString("webhookurl");
            const webhooks = await interaction.guild.fetchWebhooks();
            const webhook = webhooks.find(e => e.url == webhookURL);
            const customId = interaction.options.getString("customid");
            //@ts-ignore
            const channel: Channel = interaction.options.getChannel("channel") || interaction.channel;
            const data = await repo.findOneBy({
                customId: customId
            });

            if(!data){
                return ErrorMessage(
                    `An invalid embed code was sent!`,
                    interaction,
                    "blob_glitch"
                ); 
            }

            if(webhook.owner.id != client.user.id){
                return ErrorMessage(
                    `The webhook must be made by me!`,
                    interaction,
                    "blob_glitch"
                );
            }

            if(!channel.isTextBased()){
                return ErrorMessage(
                    `The channel must be a text channel!`,
                    interaction,
                    "blob_glitch"
                );
            }
            
            const payload = {
                embeds: [
                    parseEmbed(data)
                ]
            };

            //@ts-ignore
            const message: Message = webhook != null ? await webhook.send(payload) : await channel.send(payload);

            await interaction.reply({
                ephemeral: true,
                embeds: new Embed()
                .setTitle(`${client.customEmojis.get("check_")} Sent Embed`)
                .setDescription(`The embed has been sent to ${channel}.`)
                .build(),
                components: [
                    {
                        type: 1,
                        components: [
                            new MessageButton()
                            .setLabel(`Jump to message`)
                            .setURL(message.url)
                            .setStyle(ButtonStyle.Link)
                        ]
                    }
                ]
            });
        }
    }
}