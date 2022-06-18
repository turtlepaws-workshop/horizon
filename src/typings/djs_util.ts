declare module 'discord.js-util' {
    type ContextMenuType = "USER" | "MESSAGE";

    type ContextMenuData = {
        default_permission: boolean,
        name: string,
        type: ContextMenuType
    };

    class ContextMenuBuilder {
        public data: ContextMenuData;

        setDefaultPermission(v: boolean): ContextMenuBuilder;
        setName(name: string): ContextMenuBuilder;
        setType(type: ContextMenuType): ContextMenuBuilder;
        toJSON(): ContextMenuData;
    }
}