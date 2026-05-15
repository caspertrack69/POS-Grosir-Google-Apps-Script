import { describe, expect, it } from "vitest";
import { generateNoInvoice, generateNoTransaksi } from "../utils/generateNoInvoice";

describe("generate nomor dokumen", () => {
  it("membuat format invoice ", () => {
    const invoiceId = generateNoInvoice(new Date("2026-05-15T10:00:00.000Z"), 42);

    expect(invoiceId).toBe("INV-20260515-0042");
  });

  it("membuat format transaksi ", () => {
    const transaksiId = generateNoTransaksi(new Date("2026-05-15T10:00:00.000Z"), 42);

    expect(transaksiId).toBe("TRX-20260515-0042");
  });
});
