import { ModifiedContextMenuBuilder } from "../../lib/SlashCommandBuilder";
import { Plugin } from "../../lib/plugin";

const base = "../modules/BetterVerification";
export default class BetterVerification extends Plugin {
    constructor(){
        super({
            name: "BetterVerification",
            start: async (client) => { },
            commands: [],
            contextMenus: [
                new ModifiedContextMenuBuilder()
                .setName("Ignore User")
                .setType("USER")
            ],
            files: {
                commands: [],
                events: [
                    {
                        location: `${base}/onJoin`
                    }
                ],
                menus: []
            }
        })
    }
}