import clonedeep from "lodash.clonedeep"; 

/**
 *   @param unparsedValue {Object|String} JSON或可被JSON.parse()解析的primitive值
 *   @return {Object}
 */
export const deepJSONParse = unparsedValue => {
  unparsedValue = clonedeep(unparsedValue);
  return (function parse(json) {
    if (!json) {
      //"" null undefined 0
      return json;
    }
    if (typeof json !== "object") {
      try {
        let value = JSON.parse(json);
        if (typeof value === "number" || typeof json === "number") {
          //number
          return json;
        }
        if (typeof value === "string") {
          value = parse(value);
        }
        json = value;
      } catch (e) {
        //不可再解析的string
        return json;
      }
    }
    Object.entries(json).forEach(([key, value]) => {
      if (value) {
        json[key] = parse(value);
      }
    });
    return json;
  })(unparsedValue);
};

/**
 *   @param source {Object}  要进行匹配的对象
 *   @param map  {Map}   匹配样板Map
 */
export const getMatchValue = (source, map) => {
  for (let key of map.keys()) {
    //当key为函数时
    if (key instanceof Function) {
      if (key(source)) {
        return map.get(key);
      }
      continue;
    }
    //当key为对象时
    if (
      Object.entries(key).every(([key, value]) => {
        return (
          value === source[key]
          || value === (source[key] instanceof Function ? source[key]() : !value)
        );
      })
    ) {
      return map.get(key);
    }
  }
};

export const objectIncludes = (source, another) => {
  return Object.entries(another).every(([key, value]) => {
    return source.hasOwnProperty(key) && source[key] === value;
  });
};
