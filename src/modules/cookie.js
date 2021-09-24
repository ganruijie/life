export function set(
  name,
  value,
  expires = null,
  path = "/",
  domain = null,
  secure = false
) {
  var exp = new Date();
  expires ? exp.setMinutes(exp.getMinutes() + parseInt(expires)) : "";
  document.cookie
    = name
    + "="
    + escape(value)
    + (expires ? ";expires=" + exp.toGMTString() : "")
    + (path ? ";path=" + path : "")
    + (domain ? ";domain=" + domain : "")
    + (secure ? ";secure" : "");
}

export function get(name) {
  var reg = new RegExp("(^| )" + name + "(?:=([^;]*))?(;|$)"),
    val = document.cookie.match(reg);
  return val ? (val[2] ? unescape(val[2]) : "") : null;
}

export function del(name, path, domain, secure) {
  var value = get(name);
  if (value != null) {
    var exp = new Date();
    exp.setMinutes(exp.getMinutes() - 1000);
    path = path || "/";
    document.cookie
      = name
      + "=;expires="
      + exp.toGMTString()
      + (path ? ";path=" + path : "")
      + (domain ? ";domain=" + domain : "")
      + (secure ? ";secure" : "");
  }
}

//逐层删除cookie，直到取不到指定的key时
export function remove(key) {
  function oDel(options) {
    del(key, options);
    return !get(key);
  }

  let location = window.location,
    hostname = location.hostname,
    pathname = location.pathname,
    hostNames = hostname.split("."),
    pathNames = pathname.split("/"),
    domain = "",
    pathLen = pathNames.length,
    path;

  if (oDel()) {
    return;
  }

  for (let i = hostNames.length - 1; i >= 0; i--) {
    const hostName = hostNames[i];
    if (hostName === "") {
      continue;
    }
    domain = domain === "" ? hostName : hostName + "." + domain;

    path = "/";
    if (oDel({ domain: domain, path: path }) || oDel({ domain: domain })) {
      return;
    }

    for (let j = 0; j < pathLen; j++) {
      const pathName = pathNames[j];
      if (pathName === "") {
        continue;
      }

      path += pathName;
      if (oDel({ domain: domain, path: path }) || oDel({ path: path })) {
        return;
      }

      path += "/";
      if (oDel({ domain: domain, path: path }) || oDel({ path: path })) {
        return;
      }
    }
  }
}

export default {
  set,
  get,
  del,
  remove
};
