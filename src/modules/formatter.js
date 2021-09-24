export function formatPrice(p, padZero = false) {
  return p
    ? Number((p / 1000).toFixed(2)).toString().replace(/(\d+)(\.?)(\d*)/, (p, p1, p2, p3) =>{
      return padZero ? p1 + (p2 || ".") + p3.padEnd(2, "0") : p;
    })
    : "0.00";
}

export const formatData = (value, MUnit = "M", GUnit = "G") => {
  const mUnitValue = value / 1000;
  return mUnitValue >= 1024 ? (mUnitValue / 1024) + GUnit : mUnitValue + MUnit;
};

/**
 * @param {Date|Number|String} tt 时间
 * @param {String} str 格式化字符串
 * */
export function formatDate(tt, str) {
  if (!(tt instanceof Date)) {
    tt = tt * 1;
    tt = new Date(tt);
  }
  return str
    .replace(/yyyy/gi, tt.getFullYear())
    .replace(
      /mm/gi,
      tt.getMonth() + 1 >= 10 ? tt.getMonth() + 1 : "0" + (tt.getMonth() + 1)
    )
    .replace(/dd/gi, tt.getDate() >= 10 ? tt.getDate() : "0" + tt.getDate())
    .replace(/hh/gi, tt.getHours() >= 10 ? tt.getHours() : "0" + tt.getHours())
    .replace(
      /ii/gi,
      tt.getMinutes() >= 10 ? tt.getMinutes() : "0" + tt.getMinutes()
    )
    .replace(
      /ss/gi,
      tt.getSeconds() >= 10 ? tt.getSeconds() : "0" + tt.getSeconds()
    )
    .replace(/m/gi, tt.getMonth() + 1)
    .replace(/d/gi, tt.getDate())
    .replace(/h/gi, tt.getHours())
    .replace(/i/gi, tt.getMinutes())
    .replace(/s/gi, tt.getSeconds());
}

/**
 *    返回一个表示时间长度的字符串，小时以上的单位转换为小时加到小时位置上。
 *   @param {Number}  time 时间长度
 *   @param {String}  formatStr 格式化字符串
 */
export function formatHours(time, formatStr = "hh:ii:ss") {
  const zeroTime = new Date(-28800000).getTime();
  let result = formatDate(time + zeroTime, "h:i:s").split(":");
  let days = Math.trunc(time / (1000 * 60 * 60 * 24));
  //prettier-ignore
  result[0] = Number(result[0]) + (days * 24);
  return formatStr
    .replace(/hh/gi, result[0] >= 10 ? result[0] : "0" + result[0])
    .replace(/ii/gi, result[1] >= 10 ? result[1] : "0" + result[1])
    .replace(/ss/gi, result[2] >= 10 ? result[2] : "0" + result[2])
    .replace(/h/gi, result[0])
    .replace(/i/gi, result[1])
    .replace(/s/gi, result[2]);
}
