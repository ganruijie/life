import * as formatter from "@/modules/formatter.js";

describe("unit modules/formatter", function () {
  test("formatPrice li to yuan keep 2 decimal", () => {
    expect(formatter.formatPrice(1000)).toBe("1.00");
  });

  test("formatPrice fasly to 0.00", () => {
    expect(formatter.formatPrice()).toBe("0.00");
  });

  test("formatPrice not Number to NaN", () => {
    expect(formatter.formatPrice("aa")).toBe("NaN");
  });
});