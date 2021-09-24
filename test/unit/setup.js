import init from "@/../mock/appEnv.js";
const g = window;
g.__JE = g.navigator.userAgent.indexOf("jest/ios") > -1 ? "ios" : "android";
init(g);
