function serialize(o, d:number = 0):String {
  if (o === null || o === undefined) {
    return "null";
  } else if (typeof o === 'string') {
    return `"${o}"`
  } else if (typeof o === 'number' || typeof o === 'boolean') {
    return `${o}`;
  } else {
    if (d > 2) {
      return '...';
    } else if (Array.isArray(o)) {
      let arr = o;
      if (o.length > 3) {
        arr = o.slice(0,3);
      }
      let res = `${arr.map(v => serialize(v, d+1))}`;
      return o.length > 3 ? `[${res}, ...]#${o.length}` : `[${res}]`;
    } else if (_.isPlainObject(o)) {
      let keys = Object.keys(o);
      let outKeys = keys;
      if (keys.length > 3) {
        outKeys = keys.slice(0,3);
      }
      let res = JSON.stringify(
        _.fromPairs(
          outKeys.map(x => [x, serialize(o[x], d+1)])
        )
      ).replace(/"/g, "'");
      return keys.length > 3 ? res.replace(/}$/, '...}') : res;
    } else {
      return '[Object]';
    }
  }  
}

export function PrettySerialize() {
    return (inp) => serialize(inp);  
}  