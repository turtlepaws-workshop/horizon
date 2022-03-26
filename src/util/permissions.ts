import { Client, Permissions, PermissionString } from "discord.js";

export function calculatePermissionForRun(client: Client){
    const permissions: Permissions = new Permissions;

    client.commands.all.forEach(e => {
        e.runPermissions.forEach(p => {
            permissions.add(p);
        })
    });

    return permissions;
}