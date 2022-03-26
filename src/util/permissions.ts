import { Client, Permissions, PermissionString } from "discord.js";

export function calculatePermissionForRun(client: Client){
    const permissions: Permissions = new Permissions;

    for(const cmd of client.commands.all){
        if(cmd.runPermissions != null){
            for(const perm of cmd.runPermissions){
                permissions.add(perm);
            }
        }
    }

    return permissions;
}