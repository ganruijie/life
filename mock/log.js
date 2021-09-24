export function debug(msg, ...rest) {
  console.log("%c[mock] " + msg, "color: orange", ...rest);
}
