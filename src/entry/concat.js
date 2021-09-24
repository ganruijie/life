import ClipboardJS from "clipboard";
import { fetchFn, computeSucc } from "@/modules/api.js";
import url from "@/modules/url.js";
import initalize from "@/init";
import tips from "@/components/tips/index.js";
import * as error from "@/config/error.js";
import { AVATAR_PREFIX } from "@/config/code.js";
import DEFAULT_CONTACT from "@/assets/contact/ic-default-contact.png";

const SELLER = 2;
const forEach = Array.prototype.forEach;

function select(str) {
  return document.querySelector(str);
}

let info,
  token = url.getParam("supportDetailToken"),
  osCode = url.getParam("osCode");

function getConcat() {
  tips.showLoading();
  if (!token) {
    info = JSON.parse(window.localStorage.getItem("concat"));
    tips.removeLoading();
    return Promise.resolve();
  } else if (token) {
    return computeSucc(fetchFn)({
      url: "/xmallwebgw/dispatcher",
      param: { requestToken: token, osCode },
      methods: "GET"
    })
      .then(res => {
        info = res;
        return res;
      })
      .catch(err => {
        tips.showAlert({
          text: err.errorMessage || error.msg[error.code.NET_ERR]
        });
        return Promise.resolve(err);
      })
      .finally(() => {
        tips.removeLoading();
      });
  }
}

function addEvent() {
  new ClipboardJS(".j-copy");
  select(".j-copy").addEventListener("click", function () {
    tips.showAlert({ text: "复制成功" });
  });
}

function render() {
  select(".j-copy").setAttribute("data-clipboard-text", info.supportMobile);
  select("#j-type").innerText = info.selfDefinedFlag
    ? "群主自营商品"
    : "平台推荐商品";
  if (info.supportNickName) {
    select("#j-nickname").innerText = info.supportNickName;
  }
  if (info.supportMobile) {
    select("#j-xianliaoid").innerText = info.supportMobile;
  }
  select("#j-groupname").innerText = info.groupName;
  select("#j-avatar").setAttribute(
    "src",
    info.supportSmallAvatarUrl
      ? AVATAR_PREFIX + info.supportSmallAvatarUrl
      : DEFAULT_CONTACT
  );

  let from = info.requestFrom === SELLER ? "买家" : "卖家";
  forEach.call(document.querySelectorAll(".j-concat-from") || [], function (
    ele
  ) {
    ele.innerText = from;
  });
}

initalize(function () {
  getConcat()
    .then(() => {
      render();
      addEvent();
    })
    .catch(() => {});
});
