import { Client } from "discord.js";
import * as klawSync from "klaw-sync";
import { basename } from "path";

export default function(client: Client) {
    const EventFiles = klawSync("./dist/events", { nodir: true, traverseAll: true, filter: f => f.path.endsWith('.js') });

    for(const EventFile of EventFiles){
        const rEvent = require(EventFile.path);
        const event = new rEvent.default();

        client.events.set(basename(EventFile.path), event);

        if (event?.once) {
            client.once(event.event, (...args) => event.execute(client, ...args));
        } else {
            client.on(event.event, (...args) => event.execute(client, ...args));
        }
    }
}