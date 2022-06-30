export type Categories = "Bot" | "Developer" | "Info" | "Levels" | "Mod" | "Server";
export interface CategoryData {
    description: string;
    name: string;
    hidden?: boolean;
}
export interface CategoryInformationMap {
    Bot: CategoryData;
    Developer: CategoryData;
    Info: CategoryData;
    Levels: CategoryData;
    Mod: CategoryData;
    Server: CategoryData;
}

export const CategoriesInformation: CategoryInformationMap = {
    Bot: {
        description: "Bot related commands such as help and ping.",
        name: "Bot"
    },
    Developer: {
        description: "Developer commands such as reload.",
        name: "Developer[BETA]",
        hidden: true
    },
    Info: {
        description: "Information commands such as userinfo.",
        name: "Information"
    },
    Levels: {
        description: "Level commands such as rank and leaderboard.",
        name: "Levels"
    },
    Mod: {
        description: "Commands built for mods.",
        name: "Moderator"
    },
    Server: {
        description: "Server management commands.",
        name: "Server Management"
    }
}