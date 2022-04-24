import { IntentsBitField, Partials } from "discord.js";
const Intents = IntentsBitField.Flags;

export function AllPartials() {
    return [
        Partials.Channel,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.Message,
        Partials.Reaction,
        Partials.ThreadMember,
        Partials.User
    ]
}

export function AllIntents(options?: {
    messageContent?: boolean;
    typing?: boolean;
    guildEvents?: boolean;
    guildVoice?: boolean;
    guildBots?: boolean;
    directMessages?: boolean;
}) {
    Object.assign({
        messageContent: true,
        typing: true,
        guildEvents: true,
        guildVoice: true,
        guildBots: true,
        directMessages: true
    }, options);

    return [
        ...(options.directMessages == true ? [
            Intents.DirectMessageReactions,
            Intents.DirectMessages,
        ] : []),
        ...(options.guildBots == true ? [Intents.GuildIntegrations] : []),
        ...(options.typing == true ? [
            Intents.GuildMessageTyping,
            Intents.DirectMessageTyping
        ] : []),
        ...(options.guildEvents == true ? [
            Intents.GuildBans,
            Intents.GuildEmojisAndStickers,
            Intents.GuildInvites,
            Intents.GuildMembers,
            Intents.GuildMessageReactions,
            Intents.GuildMessages,
            Intents.GuildPresences,
            Intents.GuildScheduledEvents,
            Intents.GuildWebhooks,
            Intents.Guilds,
        ] : []),
        ...(options.guildVoice == true ? [Intents.GuildVoiceStates] : []),
        ...(options.messageContent == true ? [Intents.MessageContent] : [])
    ]
}