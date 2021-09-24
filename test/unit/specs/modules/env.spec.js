import * as env from "@/modules/env.js";

describe("unit modules/env", function () {
  test("isIos", () => {
    expect(env.isIos()).toBe(window.__JE === "ios" ? true : false);
  });
  test("isAndroid", () => {
    expect(env.isAndroid()).toBe(window.__JE === "android" ? true : false);
  });
  test("isXL", () => {
    expect(env.isXL()).toBe(true);
  });
});