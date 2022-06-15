import { Client } from "discord.js";
import klawSync from "klaw-sync";
import { basename } from "path";
import { generateId } from "../lib/ID";

export default function (client: Client) {
    const EventFiles = klawSync("./dist/events", { nodir: true, traverseAll: true, filter: f => f.path.endsWith('.js') });

    for (const EventFile of EventFiles) {
        const rEvent = require(EventFile.path);
        const event = new rEvent.default();

        client.events.set(basename(EventFile.path), event);

        if (event?.once) {
            client.once(event.event, (...args) => event.execute(client, ...args));
        } else {
            client.on(event.event, (...args) => event.execute(client, ...args));
        }
    }

    for (const pluginR of client.plugins.values()) {
        const plugin = new pluginR();
        for (const eventv of plugin.files.events) {
            const rEvent = require(eventv.location);
            const event = new rEvent.default();

            client.events.set(generateId(), event);

            if (event?.once) {
                client.once(event.event, (...args) => event.execute(client, ...args));
            } else {
                client.on(event.event, (...args) => event.execute(client, ...args));
            }
        }
    }
}