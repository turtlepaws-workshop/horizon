import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, Client, ButtonBuilder as MessageButton, ButtonStyle, ApplicationCommandOptionType, SelectMenuBuilder, ActionRowBuilder, ComponentType } from "discord.js";
import { Embed } from "../../util/embed";
import { calculatePermissionForRun, getFilesFromDir } from "../../util/util";
import Command from "../../lib/command";
import HorizonSlashCommandBuilder from "../../lib/SlashCommandBuilder";
import { createURL, generateDashboardURL, website } from "../../config/config";
import { Pages } from "utilsfordiscordjs";
import { Categories, CategoriesInformation } from "../../typings/types";

export default class Help extends Command {
    constructor(){
        super({
            commandBuilder: new HorizonSlashCommandBuilder()
            .setName("help")
            .setDescription("Learn more about Horizon."),
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: [],
            category: "Bot"
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        //base embeds
        const GettingStartedEmbed = new Embed()
        .setTitle("Welcome to Horizon")
        .setURL(createURL("/interactive-quickstart"))
        const baseEmbed = new Embed()
        .setThumbnail(client.user.displayAvatarURL())
        .setTitle("Welcome to Horizon")
        .setURL(createURL("/interactive-quickstart"))
        const selectMenu = new SelectMenuBuilder()
        .setOptions(
            Object.entries(CategoriesInformation).map(
                ([key, value]) => ({
                    label: value.name,
                    value: key,
                    description: value.description
                })
            )
        )
        .setPlaceholder("Selecting a category...")
        .setCustomId("SELECTOR_MENU");
        const row = new ActionRowBuilder().setComponents(selectMenu);
        //split commands by category
        const fetchCommandCategory = (category: Categories) => {
            const embed = new Embed(baseEmbed)
            const commands = client.commands.all.filter(async e => e.category == category);
                    //generate embed
            const pages: Embed[] = [];

            let text = ""
            const splitCommands: Command[][] = [];
            for(let i = 0; i < commands.length; i++){
                if(i % 6 === 0){
                    splitCommands.push([]);
                }
                splitCommands[splitCommands.length - 1].push(commands[i]);
            }
            for(let i = 0; i < splitCommands.length; i++){
                //here we're taking commands and putting them in embeds
                
                const embed = new Embed(baseEmbed);
                let description: string[] = [];
                splitCommands[i].map(e => {
                    const usage = "COMING SOON"//e.builder.builder.options.map(e => e.toJSON).map(e => `${e.name}`).join(" ");
                    description.push(`[**/${e.name}**](${generateDashboardURL(interaction.guild.id)})\n${client.customEmojis.get("fec_notice")} ${e.description}`);
                });
                embed.setDescription(description.join("\n\n"));
                pages.push(
                    embed
                );
            }

            return new Pages()
            .setEmbeds(pages)
            .setComponents([selectMenu]);
        }

        const message = await interaction.reply({
            embeds: GettingStartedEmbed.build(),
            components: [
                //@ts-expect-error
                row
            ],
            fetchReply: true
        });

        let collector = message.createMessageComponentCollector({
            componentType: ComponentType.SelectMenu
        });

        collector.on("collect", async sm => {
            const category = sm.customId as Categories;
            const pages = fetchCommandCategory(category);
            
            pages.setEventListener(sm => {
                const category = sm.customId as Categories;
                const pages = fetchCommandCategory(category);
            })
            await pages.send(sm);
        });
    }
}