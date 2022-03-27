import { Client } from "discord.js";
import * as klawSync from "klaw-sync";
import { basename } from "path";

export default function(client: Client) {
    const MenuFiles = klawSync("./dist/menus", { nodir: true, traverseAll: true, filter: f => f.path.endsWith('.js') });

    for(const MenuFile of MenuFiles){
        const rMenu = require(MenuFile.path);
        const menu = new rMenu.default();

        client.menus.set(basename(MenuFile.path), menu);
    }
}