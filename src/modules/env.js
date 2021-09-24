export function isIos() {
  return /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent);
}

export function isAndroid() {
  return /(Android|Linux)/i.test(navigator.userAgent);
}

export function isXL() {
  return /XLMessenger/i.test(navigator.userAgent);
}

export const osCode = isIos() ? 2 : 1;

export default {
  isIos,
  isAndroid,
  isXL,
  osCode
};
