export  function getParam(name, url) {
  //参数：变量名，url为空则表从当前页面的url中取
  var u = url || window.location.search,
    reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"),
    r = u.substr(u.indexOf("?") + 1).match(reg);
  return r != null ? r[2] : "";
}

export  function join(url, obj) {
  var oldObj = {},
    newObj,
    paramArr = [],
    host,
    path,
    hash;
  var get = /([^&]+)=([^&]+)/,
    regUrl = /^((http|https|ftp):\/\/)?(((?:\w+\.){2,4}\w+|localhost)?(:[0-9]{1,4})?)?([a-zA-Z0-9_\-./~]+)?(\?[\w&%~\-={}[\]@:() ]+)?(#[\w&%~\-={}[\]@:() ]+)?/,
    result;
  // 正则结果[url, protocol://, protocol, host, hostname, :port, path, search, hash]
  if (
    !url
    || (!(url instanceof Object) && !obj)
    || (typeof url === "string" && !(obj instanceof Object))
  ) {
    return url;
  }

  if (url instanceof Object) {
    obj = url;
    url = location.href;
  }

  result = url.match(regUrl);

  host = result[3] || "";
  path = result[6] || "";
  hash = result[8] || "";
  // 序列化旧得参数列表，并将旧参数写入到obj中
  if (result[7]) {
    result[7]
      .replace("?", "")
      .split("&")
      .forEach(item => {
        var param = item.match(get);
        oldObj[param[1]] = param[2];
      });
  }
  newObj = Object.assign(oldObj, obj);
  // 拼接参数列表
  Object.keys(newObj).forEach(name => {
    let value = newObj[name];
    if (value && typeof value === "object") {
      paramArr.push(name + "=" + JSON.stringify(value));
    } else if (typeof value === "number" || typeof value === "string") {
      paramArr.push(name + "=" + value);
    }
  });

  return result[2] + "://" + host + path + "?" + paramArr.join("&") + hash;
}

export const genSearchStr = (obj) => {
  return Object.entries(obj).reduce((pre, [name, value]) => {
    return pre + `&${name}=${value}`;
  }, "").slice(1);
};

export default {
  getParam,
  join,
  genSearchStr
};
