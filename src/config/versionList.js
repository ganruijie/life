import { isAndroid } from "@/modules/env";
let android = isAndroid();
const type = {
  DEFAULT_TYPE: 0,
  FIRST_TYPE: 4,
  SECOND_TYPE: 5,
  THRID_TYPE: 6,
  TOURTH_TYPE: 7
};
export const VERSION_LIST = [
  [type.DEFAULT_TYPE, [
    {keys: "fee", name: "话费充值"},
  ]],
  [type.FIRST_TYPE, [
    {keys: "fee", name: "话费充值"},
    {keys: "video", name: "视频会员"},
    {keys: "game", name: "游戏充值"}
  ]],
  [type.SECOND_TYPE, [
    {keys: "fee", name: "话费充值"},
    {keys: "video", name: "视频会员"},
    {keys: "game", name: "游戏充值"},
    {keys: "serve", name: "QQ服务"},
  ]],
  [type.THRID_TYPE, [
    {keys: "fee", name: "话费充值"},
    {keys: "video", name: "视频会员"},
    {keys: "game", name: "游戏充值"},
    {keys: "serve", name: "QQ服务"},
  ]],
  [type.TOURTH_TYPE, [
    {keys: "fee", name: "话费充值"},
    {keys: "video", name: "视频会员"},
    {keys: "game", name: "游戏充值"},
    {keys: "serve", name: "QQ服务"},
  ]],
];