import { BitField, BitFieldResolvable, Client, PermissionsBitField, User, PermissionsString, GuildMember } from "discord.js";
import { Developers } from "../config/config";
import { PermissionString } from "../typings";

export function calculatePermissionForRun(client: Client){
    const permissions: PermissionsBitField = new PermissionsBitField;

    for(const cmd of client.commands.all){
        if(cmd.runPermissions != null){
            for(const perm of cmd.runPermissions){
                //@ts-expect-error
                if(perm == "Developer") continue;
                permissions.add(perm);
            }
        }
    }

    return permissions;
}

function handleDeveloperCheck(userId: string){
    return Developers.includes(userId);
}

export function hasPermissionByArray(user: GuildMember, permissions: PermissionString[]) {
    if((permissions != null && permissions.length != 0) && permissions.includes("Developer")){
        return handleDeveloperCheck(user.id);
    } else {
        //@ts-expect-error
        const Permissions = new PermissionsBitField(permissions);
        return user.permissions.has(Permissions);
    }
}

export function hasPermission(user: GuildMember, permission: PermissionString){
    if(permission == "Developer"){
        return handleDeveloperCheck(user.id);
    } else {
        return user.permissions.has(permission);
    }
}

export function somePermission(user: GuildMember, permissions: PermissionString[]){
    if(permissions.includes("Developer")){
        return handleDeveloperCheck(user.id);
    } else {
        //@ts-expect-error
        const Permissions = new PermissionsBitField(permissions);
        return user.permissions.any(Permissions);
    }
}