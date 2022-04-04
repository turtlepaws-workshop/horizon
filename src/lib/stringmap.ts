export default class StringMap<K, V> {
  public _values: object = {};

  get(key: K): V {
    //@ts-expect-error
    let value = this._values[key];
    return value != null ? value : null;
  }

  set(key: K, value: V) {
    if (key instanceof Object) {
      for (let prop in key) {
        //@ts-expect-error
        this._values[prop] = key[prop];
      }
    } else {
      //@ts-expect-error
      this._values[key] = value;
    }
  }

  exists(key: K) {
    //@ts-expect-error
    return this._values[key] != null;
  }

  remove(key: K) {
    if (this.exists(key)) {
      //@ts-expect-error
      return delete this._values[key];
    }
    return false;
  }

  keys(): K[] {
    let keys = [];
    for (let prop in this._values) {
      //@ts-expect-error
      if (this.exists(prop)) {
        keys.push(prop);
      }
    }
    return keys;
  }

  toString(formatted?: boolean, ident?: string) {
    if (formatted) {
      return JSON.stringify(this._values, null, ident || '\t');
    }
    return JSON.stringify(this._values);
  }
}

export function parseStringMap(str: string) {
  if(str.length <= 0) return new Map();
  const json = JSON.parse(str);
  const map = new Map<string, string>();
  for (const key of Object.keys(json)) {
    map.set(key, json[key]);
  }
  return map;
}