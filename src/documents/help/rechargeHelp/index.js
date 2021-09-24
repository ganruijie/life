import { isAndroid } from "@/modules/env";
let android = isAndroid();
let listConfig = [];
if (android) {
  listConfig = [
    { id: "0", title: "如何充值手机话费" },
    { id: "6", title: "如何充值视频会员" },
    { id: "9", title: "如何充值游戏" },
    { id: "10", title: "如何充值QQ服务" },
    { id: "1", title: "话费充值未到账" },
    { id: "7", title: "视频、游戏、QQ服务充值未到账" },
    { id: "2", title: "话费充值充错号码怎么办" },
    { id: "8", title: "视频、游戏、QQ服务充值时充错账号怎么办" },
    { id: "5", title: "okPay话费充值协议" }
  ];
} else {
  listConfig = [
    { id: "0", title: "如何充值手机话费" },
    { id: "1", title: "话费充值未到账" },
    { id: "2", title: "话费充值充错号码怎么办" },
    // { id: "3", title: "充值没有到账怎么办" },
    { id: "5", title: "okPay话费充值协议" }
  ];
}
const configs = {
  title: "充值中心帮助",
  id: "rechargeHelp",
  list: listConfig
};

export default configs;
