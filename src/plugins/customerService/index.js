import component from "./CustomerService.vue";
import Vue from "vue";
import { computeSucc, cookie, getSupportLink } from "./utils";
Vue.use(component);

export const CustomerService = component;

export const getSupport = async (baseUrl, alwaysShowError = false) => {
  const openId
    = cookie.get("openId") || cookie.get("deepOpenId") || sessionStorage.openId;
  const token
    = cookie.get("token") || cookie.get("deepToken") || sessionStorage.token;
  if (openId && token) {
    try {
      const { data } = await computeSucc(getSupportLink)({
        baseUrl,
        openId,
        token,
        timer: Date.now()
      });
      //token有效标记
      sessionStorage.setItem("TOKEN_VALID", "true");
      return data;
    } catch (err) {
      //16为token过期
      if (err.errorCode === 16) {
        //安卓webview不会清空cookie，以下皆为兼容旧版本客户端
        //如果过期就清除cookie
        cookie.remove("openId");
        cookie.remove("token");
        cookie.remove("deepOpenId");
        cookie.remove("deepToken");
        sessionStorage.removeItem("openId");
        sessionStorage.removeItem("token");
        /*
        tokenValid标记不存在，不是webview页面内返回,
        即为从app-[我]-[帮助]进入页面且ios客户端没有设置有效的token,
        关于页面的设置的过期token仍然存在,不报错。
        */
        if (!sessionStorage.TOKEN_VALID && !alwaysShowError) {
          return false;
        }
      }
      return await Promise.reject(err);
    }
  }
};

let customerService = Vue.customer;
customerService.getSupport = getSupport;

export default customerService;
