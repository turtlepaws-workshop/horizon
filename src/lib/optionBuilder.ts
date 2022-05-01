//@ts-nocheck since its deprecated
import { SlashCommandBuilder } from "@discordjs/builders";

////////////////
// DEPRECATED //
////////////////
export default class SlashCommandOptionBuilder {
    public builder: SlashCommandBuilder;

    constructor(){
        this.builder = new SlashCommandBuilder();
    }

    addStringOption(name: string, description: string, req: boolean = false, choices?: [name: string, value: string][]): this {
        this.builder.addStringOption(o => {
            o.setName(name)
            .setDescription(description)
            .setRequired(req)
            if(choices != null) o.addChoices(choices)
            return o;
        });
        return this;
    }

    addBooleanOption(name: string, description: string, req: boolean = false): this {
        this.builder.addBooleanOption(o => {
            return o.setName(name)
            .setRequired(req)
            .setDescription(description);
        });
        return this;
    }

    addChannelOption(name: string, description: string, req: boolean = false): this {
        this.builder.addChannelOption(o => {
            return o.setName(name)
            .setRequired(req)
            .setDescription(description);
        });
        return this;
    }

    addMentionableOption(name: string, description: string, req: boolean = false): this {
        this.builder.addMentionableOption(o => {
            return o.setName(name)
            .setRequired(req)
            .setDescription(description);
        });
        return this;
    }

    addIntegerOption(name: string, description: string, req: boolean = false): this {
        this.builder.addIntegerOption(o => {
            return o.setName(name)
            .setRequired(req)
            .setDescription(description);
        });
        return this;
    }
    
    addNumberOption(name: string, description: string, req: boolean = false): this {
        this.builder.addNumberOption(o => {
            return o.setName(name)
            .setRequired(req)
            .setDescription(description);
        });
        return this;
    }

    addRoleOption(name: string, description: string, req: boolean = false): this {
        this.builder.addRoleOption(o => {
            return o.setName(name)
            .setRequired(req)
            .setDescription(description);
        });
        return this;
    }

    addUserOption(name: string, description: string, req: boolean = false): this {
        this.builder.addUserOption(o => {
            return o.setName(name)
            .setRequired(req)
            .setDescription(description);
        });
        return this;
    }
}