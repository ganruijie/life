import * as cookie from "@/modules/cookie.js";
describe("unit modules/cookie", () => {
  test("cokie set-get", () => {
    cookie.set("test", "1");
    expect(cookie.get("test")).toBe("1");
  });
  
  test("cokie set-del-get", () => {
    cookie.set("test", "1");
    cookie.del("test");
    expect(cookie.get("test")).toBe(null);
  });

  test("cokie set with path", () => {
    cookie.set("test", "1", null, "/");
    cookie.set("test", "2", null, "/item.html");
    expect(cookie.get("test")).toBe("1");
  });

  test("cokie set with domain", () => {
    cookie.set("test", "1", null, undefined, location.hostname);
    cookie.set("test", "2", null, undefined, "www.baidu.com");
    expect(cookie.get("test")).toBe("1");
  });
  // @todo cookie delete with domain/path
});