import { ApplicationCommandOptionChoiceData, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";

interface Autocomplete extends ApplicationCommandOptionChoiceData {};

class AutocompleteHelper {
    public suggestions: (Autocomplete | string)[] = [];

    constructor(public query: string, public array: (Autocomplete | string)[]) {}

    private isAutocompleteForm(input: (string | object)[]): input is Autocomplete[] {
        if(typeof input[0] === "string"){
            return false;
        } else if(typeof input[0] === "object"){
            return true
        }
    }

    private isString(input: (string | object)[]): input is string[] {
        if(typeof input[0] === "string"){
            return true;
        } else if(typeof input[0] === "object"){
            return false
        }
    }

    getSuggestions(valueShouldBeUpperCase?: boolean) {
        if(this.isAutocompleteForm(this.array)){
            const items = this.suggestions = this.array.filter(i =>
                i.name.toLowerCase().startsWith(this.query.toLowerCase())
                ||
                i.name.toLowerCase().endsWith(this.query.toLowerCase())
            );

            return items.map(e => ({
                name: e.name,
                value: e.value
            }));
        } else if(this.isString(this.array)) {
            const items = this.suggestions = this.array.filter(i =>
                i.toLowerCase().startsWith(this.query.toLowerCase())
                ||
                i.toLowerCase().endsWith(this.query.toLowerCase())
            );

            return items.map(e => ({
                name: e,
                value: valueShouldBeUpperCase == true ? e.toUpperCase() : e
            }));
        }
    }

    async replyToInteraction(interaction: AutocompleteInteraction, valueShouldBeUpperCase?: boolean) {
        await interaction.respond(
            this.getSuggestions(valueShouldBeUpperCase)
        );
    }
}

export async function handleAutocomplete(interaction: AutocompleteInteraction, array: (Autocomplete | string)[], valueShouldBeUpperCase?: boolean) {
    const query = interaction.options.getFocused();
    if(array == null) {
        const autocomplete = new AutocompleteHelper(query, []);
        return await autocomplete.replyToInteraction(interaction, valueShouldBeUpperCase);
    }
    //@ts-ignore
    const autocomplete = new AutocompleteHelper(query, array);

    return await autocomplete.replyToInteraction(interaction, valueShouldBeUpperCase);
}

//This is for if you don't have any suggestions
export async function voidAutocomplete(interaction: AutocompleteInteraction) {
    await interaction.respond([]);
}

export function crossCheckValues(q: string, okValues: string[]) {
    return okValues.map(e => e.toLowerCase()).includes(q.toLowerCase());
}

export function getValue<Result>(i: ChatInputCommandInteraction, name: string): Result {
    //@ts-expect-error - We're using this because the type ChatInputCommandInteraction.options.get returns is not assignable to any
    return i.options.get(name);
}

export default AutocompleteHelper;