import { describe, expect, it } from "vitest";
import { applyDiscount, calculateLineTotal } from "../utils/money";

describe("money utils", () => {
  it("menghitung diskon tanpa floating-point drift", () => {
    const result = applyDiscount(28000 * 50, 10);

    expect(result.discount).toBe(140000);
    expect(result.total).toBe(1260000);
  });

  it("membulatkan diskon desimal dengan benar", () => {
    const result = calculateLineTotal(999, 3, 7.5);

    expect(result.lineTotal).toBe(2997);
    expect(result.discount).toBe(225);
    expect(result.total).toBe(2772);
  });
});
