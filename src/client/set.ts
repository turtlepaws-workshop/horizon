import { Client } from "discord.js";
import klawSync from "klaw-sync";
import { basename } from "path";
import { PluginArr } from "../modules";
import { generateId } from "../lib/ID";

export function setPluginVaribles(client: Client){
    for(const plugin of PluginArr){
        const items = klawSync(`./dist/modules/${plugin}`, { nodir: true, traverseAll: true, filter: f => f.path.endsWith('.js') });

        for(const p of client.plugins.values()){
            const plug = new p();

            for (const item of plug.files.commands) {
                const rItem = require(item.location);
                const itemObj = new rItem.default();
    
                client.commands.all.push(itemObj);
            }
    
            for (const item of plug.files.menus) {
                const rItem = require(item.location);
                const itemObj = new rItem.default();
    
                client.menus.set(basename(item.location), itemObj);
            }
        }
    }
}