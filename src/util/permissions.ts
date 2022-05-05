import { Client, PermissionsBitField } from "discord.js";

export function calculatePermissionForRun(client: Client){
    const permissions: PermissionsBitField = new PermissionsBitField;

    for(const cmd of client.commands.all){
        if(cmd.runPermissions != null){
            for(const perm of cmd.runPermissions){
                permissions.add(perm);
            }
        }
    }

    return permissions;
}