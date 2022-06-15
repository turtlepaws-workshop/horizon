import { codeBlock, SlashCommandBuilder, TextInputBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, ButtonBuilder as MessageButton, ButtonStyle, ModalBuilder, TextInputStyle, Formatters } from "discord.js";
import { Embed } from "../../util/embed";
import { actionRow, calculatePermissionForRun } from "../../util/util";
import Command from "../../lib/command";
import HorizonSlashCommandBuilder from "../../lib/SlashCommandBuilder";
import { Developers, generateDashboardURL, website } from "../../config/config";
import { generateId } from "../../lib/ID";
import { inspect } from "util";
import { clean } from "../../util/eval";

export default class Invite extends Command {
    constructor() {
        super({
            commandBuilder: new HorizonSlashCommandBuilder()
                .setName("execute")
                .setDescription("Execute some code."),
            requiredPermissions: [
                "Developer"
            ],
            runPermissions: [],
            somePermissions: []
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        const Id = "execute_code_" + generateId();
        const modalBuilder = new ModalBuilder()
            .setTitle("Execute Code...")
            .setCustomId(Id)
            .setComponents([
                actionRow(
                    new TextInputBuilder()
                        .setCustomId(Id)
                        .setLabel("Code")
                        .setPlaceholder("Type your code here.")
                        .setStyle(TextInputStyle.Paragraph)
                )
            ]);

        await interaction.showModal(modalBuilder);

        const modal = await interaction.awaitModalSubmit({
            time: 0
        });

        const code = modal.fields.getTextInputValue(Id);

        try {
            const evaled = eval(code);
            const cleaned = await clean(evaled);

            await modal.reply({
                embeds: new Embed()
                    .setTitle(`${client.customEmojis.get("fe_checked")} Executed`)
                    .addField(`${client.customEmojis.get("fe_quotes")} Executed Code`,
                        code.length >= 1023 ?
                            "The code was too long to display." :
                            Formatters.codeBlock(
                                "ts",
                                code
                            )
                    )
                    .setDescription(
                        Formatters.codeBlock(
                            "ts",
                            cleaned
                        )
                    )
                    .build()
            });
        } catch (e) {
            await modal.reply({
                embeds: new Embed()
                    .setTitle(`${client.customEmojis.get("fec_error")} Error`)
                    .addField(`${client.customEmojis.get("fe_quotes")} Executed Code`,
                        code.length >= 1023 ?
                            "The code was too long to display." :
                            Formatters.codeBlock(
                                "ts",
                                code
                            )
                    )
                    .setDescription(
                        Formatters.codeBlock(
                            "xl",
                            e
                        )
                    )
                    .build()
            });
            return;
        }
    }
}