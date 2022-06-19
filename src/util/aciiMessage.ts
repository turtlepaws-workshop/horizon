import "colors";

const Message = [
    "    __  __           _                 ",
    "   / / / /___  _____(_)___  ____  ____ ",
    "  / /_/ / __ \\/ ___/ /_  / / __ \\/ __ \\",
    " / __  / /_/ / /  / / / /_/ /_/ / / / /",
    "/_/ /_/\____/_/  /_/ /___/\____/_/ /_/ ",
    "                                       "
]

export function useAciiMessage(){
    const m = Message.join("\n").yellow;

    console.log(m);
}