import { CommandInteraction, Interaction } from "discord.js";
import { calculatePermissionForRun } from "./permissions";

async function ErrorMessage(message: string, int: Interaction){
    //@ts-ignore
    if(int?.deferred || int?.replied){
        if(int.isApplicationCommand()){
            return (await int.editReply({
                content: message
            }));
        } else if(int.isMessageComponent()){
            return (await int.update({
                content: message
            }));
        }
    } else {
        //@ts-ignore
        return (await int.reply({
            ephemeral: true,
            content: message
        }))
    }
}

export default {
    calculatePermissionForRun,
    ErrorMessage
}