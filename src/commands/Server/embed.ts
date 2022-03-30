import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, MessageButton, MessageEmbed, ApplicationCommandAutocompleteOption, AutocompleteInteraction, ApplicationCommandOptionChoice, Channel, Message } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun, ErrorMessage } from "../../util/util";
import Command from "../../lib/command";
import SignalSlashCommandBuilder from "../../lib/SlashCommandBuilder";
import { Modal, showModal, TextInputComponent } from "discord-modals";
import { v4 } from "uuid";
import EmbedData from "../../models/embed";
import { EmbedModel } from "../../typings/index";
import { website } from "../../config/config";
import { APIApplicationCommandAutocompleteResponse } from "discord-api-types";

export default class Invite extends Command {
    constructor() {
        super({
            commandBuilder: new SignalSlashCommandBuilder()
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
                "SEND_MESSAGES"
            ],
            somePermissions: [
                "MANAGE_GUILD",
                "MANAGE_MESSAGES",
                "MANAGE_CHANNELS"
            ]
        });
    }

    async autocomplete(interaction: AutocompleteInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        //@ts-expect-error
        const data: EmbedModel[] = Array.from(await EmbedData.find({
            userId: interaction.user.id
        }));
        const focus = interaction.options.getFocused().toString();

        const respond: ApplicationCommandOptionChoice[] = [];

        for(const embed of data.filter(embed => {
            const point = (embed.data.title || embed.data.author.name || embed.data.footer.text || "No data to provide.");
            
            return (point.startsWith(focus) || point.endsWith(focus))
        })){
            respond.push({
                name: (embed.data.title || embed.data.author.name || embed.data.footer.text || "No data to provide.") + ` (${embed.customId})`,
                value: embed.customId
            });
        }

        await interaction.respond(respond);
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        const subcommand = interaction.options.getSubcommand();

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
                type: "LONG" | "SHORT",
                max?: number,
                min?: number,
                req?: boolean
            }[] = [
                    {
                        customId: customId("title"),
                        name: "Title",
                        type: "SHORT",
                        max: 256
                    },
                    {
                        name: "Description",
                        customId: customId("description"),
                        max: 4000,
                        type: "LONG"
                    },
                    {
                        name: "Author",
                        customId: customId("author_name"),
                        max: 256,
                        type: "SHORT"
                    },
                    {
                        name: "Footer",
                        customId: customId("footer_name"),
                        max: 2048,
                        type: "LONG"
                    }
                ]
    
            const modal = new Modal()
                .setCustomId(modalCustomId)
                .setTitle("Embed Creator");
    
            fields.forEach(f => {
                modal.addComponents(
                    new TextInputComponent()
                        .setCustomId(f.customId)
                        .setLabel(f.name)
                        .setMaxLength(f.max)
                        .setStyle(f.type)
                        .setRequired(f.req || false)
                );
            });
    
            await showModal(modal, {
                client,
                interaction
            });
    
            client.on("modalSubmit", async m => {
                if(m.customId != modalCustomId) return;
    
                const data: EmbedModel = {
                    customId: v4(),
                    data: new MessageEmbed()
                        .setColor("BLURPLE")
                        //@ts-ignore
                        .setTitle(m.getTextInputValue(fieldIds.title))
                        //@ts-ignore
                        .setDescription(m.getTextInputValue(fieldIds.description))
                        .setURL(website)
                        .setAuthor({
                            //@ts-ignore
                            name: m.getTextInputValue(fieldIds.author_name),
                            url: website
                        })
                        .setFooter({
                            //@ts-ignore
                            text: m.getTextInputValue(fieldIds.footer_name)
                        }),
                    userId: interaction.user.id
                }
    
                await new EmbedData(data).save().catch(console.log)
    
                await m.reply({
                    embeds: [
                        new Embed()
                            .setTitle(`${client.customEmojis.get("check_")} Created`)
                            .setDescription(`The embed has been created!`)
                            .addField(`${client.customEmojis.get("channel")} Custom Id`, `\`${data.customId}\``),
                        data.data
                    ]
                })
            });
        } else if(subcommand == "send"){
            const webhookURL = interaction.options.getString("webhookurl");
            const webhooks = await interaction.guild.fetchWebhooks();
            const webhook = webhooks.find(e => e.url == webhookURL);
            const customId = interaction.options.getString("customid");
            //@ts-ignore
            const channel: Channel = interaction.options.getChannel("channel") || interaction.channel;
            //@ts-expect-error
            const data: EmbedModel = await EmbedData.findOne({
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

            if(!channel.isText()){
                return ErrorMessage(
                    `The channel must be a text channel!`,
                    interaction,
                    "blob_glitch"
                );
            }
            
            const payload = {
                embeds: [
                    data.data
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
                            .setStyle("LINK")
                        ]
                    }
                ]
            });
        }
    }
}