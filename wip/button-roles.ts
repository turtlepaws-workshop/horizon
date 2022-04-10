//@ts-nocheck
import { codeBlock } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, MessageButton, MessageActionRow, Channel, Message, TextBasedChannel, Role } from "discord.js";
import { Embed } from "../src/util/embed";
import { calculatePermissionForRun, ErrorMessage } from "../src/util/util";
import Command from "../src/lib/command";
import HorizonSlashCommandBuilder from "../src/lib/SlashCommandBuilder";
import { Color } from "../src/config/config";

export default class Invite extends Command {
    constructor() {
        super({
            commandBuilder: new HorizonSlashCommandBuilder()
                .setName("button-roles")
                .setDescription("Create button roles!"),
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: [
                "MANAGE_ROLES"
            ]
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        const CustomIds = {
            "CANCEL": "cancel_br",
            "ADD_ROLE": "add_role_br",
            "REMOVE_ROLE": "remove_role_br",
            "SEND_AS_WEBHOOK": "webhook_send_br",
            "SEND_AS_MESSAGE": "send_br"
        }

        const CancelButton = new MessageButton()
            .setCustomId(CustomIds.CANCEL)
            .setEmoji(client.customEmojis.get("leave").toString())
            .setLabel(`Cancel`)
            .setStyle("SECONDARY");
        const AddButton = new MessageButton()
            .setCustomId(CustomIds.ADD_ROLE)
            .setLabel(`Add Role`)
            .setStyle("SECONDARY")
            .setEmoji(client.customEmojis.get("create_role").toString());
        const RemoveButton = new MessageButton()
            .setCustomId(CustomIds.REMOVE_ROLE)
            .setLabel(`Remove Role`)
            .setStyle("SECONDARY")
            .setEmoji(client.customEmojis.get("delete_role").toString());
        const SendButton = {
            WEBHOOK: new MessageButton()
                .setCustomId(CustomIds.SEND_AS_WEBHOOK)
                .setLabel(`Send as Webhook`)
                .setStyle("SECONDARY")
                .setEmoji(client.customEmojis.get("links").toString()),
            SEND: new MessageButton()
                .setCustomId(CustomIds.SEND_AS_MESSAGE)
                .setLabel(`Send`)
                .setStyle("SECONDARY")
                .setEmoji(client.customEmojis.get("join").toString())
        }

        const Embeds = {
            Ask: {
                Role: new Embed()
                    .setTitle(`${client.customEmojis.get("role")} Role`)
                    .setDescription(`Please mention the role or send the role ID for the BR (Button Role).`),
                Channel: new Embed()
                    .setTitle(`${client.customEmojis.get("channel")} Channel`)
                    .setDescription(`Please mention the channel for the button roles to go in.`),
                AddRoles: new Embed()
                    .setTitle(`${client.customEmojis.get("settings")} Create button roles!`)
                    .setDescription(`In this menu you can add or remove some buttons for the button roles!`),
                Name: new Embed()
                    .setTitle(`${client.customEmojis.get("search")} Name (Button Label)`)
                    .setDescription(`Enter the name/label of the button for the role. (You can type \`skip\` to skip this!)`),
                Emoji: new Embed()
                    .setTitle(`${client.customEmojis.get("sticker")} Emoji (Button Emoji)`)
                    .setDescription(`Enter the emoji for the button for the role. (You can type \`skip\` to skip this!)`)
                    .setFooter({
                        text: `e.g. 938971205925486683 or <:join:901212275434725417>`
                    })
            },
            Rows: {
                RoleRow: [
                    new MessageActionRow()
                        .addComponents(CancelButton)
                ],
                RoleRowDisabled: [new MessageActionRow()
                    .addComponents(new MessageButton(CancelButton).setDisabled(true))],
                AddRoles: [
                    new MessageActionRow()
                        .addComponents(
                            AddButton,
                            RemoveButton,
                            CancelButton,
                            SendButton.WEBHOOK,
                            SendButton.SEND
                        )
                ],
                AddRolesDisabled: [
                    new MessageActionRow()
                        .addComponents(
                            new MessageButton(AddButton).setDisabled(true),
                            new MessageButton(RemoveButton).setDisabled(true),
                            new MessageButton(CancelButton).setDisabled(true),
                            new MessageButton(SendButton.WEBHOOK).setDisabled(true),
                            new MessageButton(SendButton.SEND).setDisabled(true),
                        )
                ],
                AwaitRole: [
                    new MessageActionRow()
                        .addComponents(
                            new MessageButton(AddButton).setDisabled(true),
                            new MessageButton(RemoveButton).setDisabled(true),
                            new MessageButton(CancelButton).setDisabled(false),
                            new MessageButton(SendButton.WEBHOOK).setDisabled(true),
                            new MessageButton(SendButton.SEND).setDisabled(true),
                        )
                ]
            },
            Other: {
                Cancel: new Embed()
                    .setTitle(`${client.customEmojis.get("xmark_")} Canceled Button Roles!`)
            }
        }

        const Options = {
            Style: interaction.options.getString("style") || "SECONDARY", //Button styles
            Color: interaction.options.getString("color") || Color, //Embed color
            Description: interaction.options.getString("description"), //Embed description
            Detail: interaction.options.getString("detailed") || "NONE"
        }

        let channel: TextBasedChannel;
        const roleArray: Role[] = [];
        let canceled = false;

        //@ts-ignore
        const Replied: Message = await interaction.reply({ embeds: Embeds.Ask.Channel.build(), components: Embeds.Rows.RoleRow, fetchReply: true });

        Replied.awaitMessageComponent({ filter: i => i.user.id == interaction.user.id }).then(async i => {
            if (!i.isButton() || i.customId != "cancel_br") return;

            canceled = true;

            await i.update({
                embeds: Embeds.Other.Cancel.build(),
                components: Embeds.Rows.RoleRowDisabled
            });
        });

        await interaction.channel.awaitMessages({
            filter: m => m.author.id == interaction.user.id
        }).then(async m => {
            if (canceled == true) return;

            //@ts-ignore
            channel = m.first().mentions.channels.first() || interaction.guild.channels.cache.find(e => e.name.toLowerCase() == m.first().content.toLowerCase()) || interaction.guild.channels.cache.get(m.first());

            if(!channel.isText()){
                return ErrorMessage(
                    `The channel must be a text channel...`,
                    interaction
                );
            }
            if (channel?.client == null) {
                Embeds.Ask.AddRoles.setFooter({
                    //@ts-ignore
                    text: `Incorrect channel! The channel has been changed to ${interaction.channel?.name}.`,
                    iconURL: client.customEmojis.get("warning").URL
                });
                channel = interaction.channel;
            }

            await interaction.editReply({ embeds: Embeds.Ask.AddRoles.build(), components: Embeds.Rows.AddRoles });

            const Roles = [];
            const RoleButtons = [];

            const Collector = Replied.createMessageComponentCollector({
                filter: i => i.user.id == interaction.user.id,
                componentType: "BUTTON"
            });

            Collector.on("collect", async i => {
                await i.update({
                    embeds: Embeds.Ask.Name.build(),
                    components: Embeds.Rows.AwaitRole
                });

                let Name;
                let Emoji;

                await i.channel.awaitMessages({
                    filter: m=>m.author.id==interaction.user.id
                }).then(async NameMessages => {
                    const NameMessage = NameMessages.first();

                    Name = NameMessage.content;

                    await i.channel.awaitMessages({
                        filter: m=>m.author.id==interaction.user.id
                    }).then(async EmojiMessages => {
                        const EmojiMessage = EmojiMessages.first();

                        Emoji = EmojiMessage.content;

                        await i.channel.awaitMessages({
                            filter: m=>m.author.id==interaction.user.id
                        }).then(async messages => {
                            const message = messages.first();
                            const MentionRole = message.mentions.roles.first();

                            if (MentionRole?.id != null) {
                                Roles.push(MentionRole);
                                RoleButtons.push(
                                    new MessageButton()
                                        .setCustomId(MentionRole.id)
                                        .setLabel(Name != null ? Name : MentionRole.name)
                                        .setEmoji(Emoji != null ? Emoji : null)
                                        //@ts-ignore
                                        .setStyle(Options.Style)
                                );
                            }
                        });
                    });
                });
            });

            await interaction.channel.awaitMessages({
                filter: m=>m.author.id==interaction.user.id
            }).then(async m2 => {
                const m3 = m2.first()

                const roles = [];

                m3.content.split(" ").forEach(e => roleArray.push(interaction.guild.roles.cache.get(e)));
                const mentions = m3.mentions.roles.size > 0 ? m3.mentions.roles.entries() : roleArray;
                let i = 0
                for (const role of mentions) {
                    if (i === 8) break;
                    i++
                    roles.push(Array.isArray(mentions) ? role : role[1])
                }
                const colorStyles = {
                    styles: ["DANGER", "PRIMARY", "SECONDARY", "SUCCESS"],
                }
                function randomColor() {
                    return colorStyles.styles[Math.round(Math.random() * colorStyles.styles.length - 1)];
                }
                if (channel.permissionsFor(interaction.guild.me).has('SEND_MESSAGES')) {
                    const buttons = {
                        style: interaction.options.getString("style") === "random" ? randomColor() : interaction.options.get('style')?.value || randomColor(),
                        r1: function () {
                            if (roles[0]) {
                                return new MessageButton()
                                    .setCustomId(roles[0]?.id || "NULL")
                                    .setLabel(roles[0]?.name || "NULL")
                                    .setStyle(buttons.style)
                            }
                        },
                        r2: function () {
                            if (roles[1]) {
                                return new MessageButton()
                                    .setCustomId(roles[1]?.id || "NULL")
                                    .setLabel(roles[1]?.name || "NULL")
                                    .setStyle(buttons.style)
                            }
                        },
                        r3: function () {
                            if (roles[2]) {
                                return new MessageButton()
                                    .setCustomId(roles[2]?.id || "NULL")
                                    .setLabel(roles[2]?.name || "NULL")
                                    .setStyle(buttons.style)
                            }
                        },
                        r4: function () {
                            if (roles[3]) {
                                return new MessageButton()
                                    .setCustomId(roles[3]?.id || "NULL")
                                    .setLabel(roles[3]?.name || "NULL")
                                    .setStyle(buttons.style)
                            }
                        },
                        r5: function () {
                            if (roles[4]) {
                                return new MessageButton()
                                    .setCustomId(roles[4]?.id || "NULL")
                                    .setLabel(roles[4]?.name || "NULL")
                                    .setStyle(buttons.style)
                            }
                        },
                        r6: function () {
                            if (roles[5]) {
                                return new MessageButton()
                                    .setCustomId(roles[5]?.id || "NULL")
                                    .setLabel(roles[5]?.name || "NULL")
                                    .setStyle(buttons.style)
                            }
                        },
                        r7: function () {
                            if (roles[6]) {
                                return new MessageButton()
                                    .setCustomId(roles[6]?.id || "NULL")
                                    .setLabel(roles[6]?.name || "NULL")
                                    .setStyle(buttons.style)
                            }
                        },
                        r8: function () {
                            if (roles[7]) {
                                return new MessageButton()
                                    .setCustomId(roles[7]?.id || "NULL")
                                    .setLabel(roles[7]?.name || "NULL")
                                    .setStyle(buttons.style)
                            }
                        },
                        allButtons: function () {
                            const roless = [
                                new MessageActionRow()
                            ]
                            if (roles[0]) {
                                roless[0].addComponents(this.r1())
                            }
                            if (roles[1]) {
                                roless[0].addComponents(this.r2())
                            }
                            if (roles[2]) {
                                roless[0].addComponents(this.r3())
                            }
                            if (roles[3]) {
                                roless[0].addComponents(this.r4())
                            }
                            if (roles[4]) {
                                roless[0].addComponents(this.r5())
                            }
                            if (roles[5]) {
                                roless.push(new MessageActionRow())
                                roless[1].addComponents(this.r6())
                            }
                            if (roles[6]) {
                                roless[1].addComponents(this.r7())
                            }
                            if (roles[7]) {
                                roless[1].addComponents(this.r8())
                            }
                            return roless
                        },
                        uuid: uuidv4(),
                        getEmbed: function () {
                            if (interaction.options.getString("detailed") == null || interaction.options.getString("detailed") === "NONE") {
                                const embed = {
                                    color: interaction.options?.get('color')?.value || color,
                                    description: interaction.options.get('description')?.value
                                }

                                return [new MessageEmbed()
                                    .setColor(embed.color)
                                    .setDescription(embed.description || `Choose some roles!`)]
                            } else {
                                let utilPos = 0;
                                /**
                                 * @type {"EMBEDS_H"|"EMBEDS_L"|"EMBED"}
                                 */
                                const optionSelected = interaction.options.getString("detailed");
                                // ["Embeds High", "EMBEDS_H"]
                                // ["Embeds Low", "EMBEDS_L"],
                                // ["One Embed", "EMBED"],
                                // ["None", "NONE"]
                                if (optionSelected == "EMBED") {
                                    return [
                                        new MessageEmbed()
                                            .setColor(interaction.options?.get('color')?.value || color)
                                            .addField(`${client.botEmojis.sroles} Roles:`, `${roles.map(e => {
                                                utilPos++
                                                return `${utilPos == roles.length ? client.botEmojis.reply.show : client.botEmojis.stem.show} ${e}`
                                            }).join(`\n`)}`)
                                    ]
                                } else if (optionSelected == "EMBEDS_H") {
                                    const EMBEDSSS = [];
                                    roles.forEach(e => {
                                        EMBEDSSS.push(new MessageEmbed()
                                            .setTitle(e.name)
                                            .addField(`Permissions`, e.permissions.toArray().map(e => "`" + e + "`"))
                                            .addField(`Emoji`, e.unicodeEmoji || "None")
                                            .addField(`ID`, e.id)
                                            .addField(`Position`, `${e.position}`)
                                            .addField(`Hoisted`, `${e.hoist}`)
                                            .setColor(e.color || "#9DA8B3")
                                            .setThumbnail(e.iconURL())
                                        )
                                    })
                                    return EMBEDSSS
                                } else if (optionSelected == "EMBEDS_L") {
                                    const EMBEDSSS = [];
                                    roles.forEach(e => {
                                        EMBEDSSS.push(
                                            new MessageEmbed()
                                                .setTitle(e.name)
                                                .setColor(e.color || "#9DA8B3")
                                                .setThumbnail(e.iconURL())
                                        )
                                    })
                                    return EMBEDSSS
                                }
                            }

                        }
                    }

                    const getRoles = () => {
                        const roleArr = []
                        roles.forEach(e => roleArr.push(e.name))
                        return roleArr.join();
                    }
                    const PAYLOAD = {
                        components: [
                            new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                        .setStyle("SECONDARY")
                                        .setLabel("Send")
                                        .setEmoji(client.botEmojis.join.show)
                                        .setCustomId("send_btns"),
                                    new MessageButton()
                                        .setCustomId("send_btns_wh")
                                        .setLabel("Send as webhook")
                                        .setEmoji(client.botEmojis.bot_add.show)
                                        .setStyle("SECONDARY")
                                )
                        ],
                        embeds: [
                            new MessageEmbed()
                                .setTitle(`Button Roles`)
                                .addField(`${client.botEmojis.role} Roles:`, roles.map(e => e.toString()).join(", "))
                                .addField(`${client.botEmojis.channel} Channel:`, channel.toString())
                                .setColor(color)
                        ]
                    }
                    await interaction.editReply(PAYLOAD);
                    /** @type {Discord.Message} */
                    const message = await interaction.fetchReply();
                    const WebHook = new WebhookBuilder().setChannel(channel);
                    let SENT_MESSAGE;
                    message.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id })
                        .then(async i => {
                            if (i.customId === 'send_btns_wh') {
                                await i.update({
                                    embeds: [
                                        {
                                            title: `${client.botEmojis.bot_add} Webhook Name`,
                                            description: `Enter the name/username of the webhook.`,
                                            color: color
                                        },

                                    ], components: [
                                        disableAllButtons([
                                            new MessageButton()
                                                .setStyle("SECONDARY")
                                                .setLabel("Send")
                                                .setEmoji(client.botEmojis.join.show)
                                                .setCustomId("send_btns"),
                                            new MessageButton()
                                                .setCustomId("send_btns_wh")
                                                .setLabel("Send as webhook")
                                                .setEmoji(client.botEmojis.bot_add.show)
                                                .setStyle("SECONDARY")
                                        ])
                                    ]
                                });
                                const WhMessage1 = await (await interaction.channel.awaitMessages({ filter: i => i.author.id === interaction.user.id, max: 1 })).first();

                                WebHook.setName(WhMessage1.content);

                                await interaction.editReply({
                                    embeds: [
                                        {
                                            title: `${client.botEmojis.bot_add} Webhook Avatar`,
                                            description: `Enter the avatar/profile picture of the webhook.\n\nEnter \`Skip\` to skip this!`,
                                            color: color
                                        }
                                    ]
                                });

                                const WhMessage2 = await (await interaction.channel.awaitMessages({ filter: i => i.author.id === interaction.user.id, max: 1 })).first();
                                let avC = WhMessage2.content;
                                if (avC.toLowerCase() == "skip") avC = null;
                                if (WhMessage2.attachments.size > 0) avC = WhMessage2.attachments.first().url;
                                if (avC != null) WebHook.setAvatar(avC)
                                const TooManyWhs = await (await channel.fetchWebhooks());
                                if (TooManyWhs.size == 10) {
                                    TooManyWhs.first().delete(`Too many webhooks!`)
                                    embeds.done.setFooter(`Deleted 1 webhook! Reason: Too many webhooks`, client.botEmojis.failed.url)
                                }
                                SENT_MESSAGE = await WebHook.CreateAndSend({ embeds: buttons.getEmbed(), components: buttons.allButtons() })
                            } else if (i.customId === "send_btns") {
                                SENT_MESSAGE = await channel.send({ embeds: buttons.getEmbed(), components: buttons.allButtons() })
                            }
                            const EndPayload = { embeds: [embeds.done], components: [new MessageActionRow().addComponents(new MessageButton().setLabel("Jump to Message").setStyle('LINK').setURL(SENT_MESSAGE.url).setEmoji(client.botEmojis.link))] };
                            i.replied ? interaction.editReply(EndPayload) : i.update(EndPayload);
                            require('../../log').log(`${interaction.user.tag} Created button roles on guild: \`${interaction.guild}\``, 'command', interaction.guild, interaction.user)
                            await new br({ //~~Err here!!~~ Fixed
                                guild: interaction.guild.id,
                                id: buttons.uuid,
                                roles: {
                                    r1: roles[0]?.id || null,
                                    r2: roles[1]?.id || null,
                                    r3: roles[2]?.id || null,
                                    r4: roles[3]?.id || null,
                                    r5: roles[4]?.id || null,
                                    r6: roles[5]?.id || null,
                                    r7: roles[6]?.id || null,
                                    r8: roles[7]?.id || null
                                },
                                button_ID: {
                                    r1: roles[0]?.id || null,
                                    r2: roles[1]?.id || null,
                                    r3: roles[2]?.id || null,
                                    r4: roles[3]?.id || null,
                                    r5: roles[4]?.id || null,
                                    r6: roles[5]?.id || null,
                                    r7: roles[6]?.id || null,
                                    r8: roles[7]?.id || null
                                },
                                messageID: SENT_MESSAGE.id
                            }).save().catch(e => console.log(e))
                        })
                }
            })
        })
    }
}