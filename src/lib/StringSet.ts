export default class StringSet extends Set {
    str(){
        const json = {};

        this.forEach(v => {
            json[v] = v;
        });

        return JSON.stringify(json);
    }
}

export function parseStringSet(str: string){
    const set = new Set();
    const json = JSON.parse(str);

    for(const key of Object.keys(json)){
        set.add(key);
    }

    return set;
}