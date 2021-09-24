import url from "@/modules/url.js";

describe("unit modules/url", () => {
  test("getParam return param or empty str", () => {
    expect(url.getParam("name", "name=3&mobiile=1")).toBe("3");
    expect(url.getParam("n", "name=3&mobiile=1")).toBe("");
  });

  test("join generate a url", () => {
    const testUrl = "http://www.baidu.com?a=12&c=3#abc";
    const testParam = { a: 1, b: "2", d: {e: 1} };
    const result ="http://www.baidu.com?a=1&c=3&b=2&d={\"e\":1}#abc";

    expect(url.join()).toBe(undefined);
    expect(url.join(testUrl, testParam)).toBe(result);
    expect(url.join(testParam)).toBe(location.href + "?a=1&b=2&d={\"e\":1}");
  });
})