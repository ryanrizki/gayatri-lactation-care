import { describe, it, expect } from "vitest";
import { clampPage } from "./pdf";

describe("clampPage", () => {
  it("mengembalikan nilai apa adanya bila di dalam rentang", () => {
    expect(clampPage(3, 12)).toBe(3);
  });

  it("membatasi ke 1 bila di bawah 1", () => {
    expect(clampPage(0, 12)).toBe(1);
    expect(clampPage(-5, 12)).toBe(1);
  });

  it("membatasi ke total bila melebihi total", () => {
    expect(clampPage(20, 12)).toBe(12);
  });

  it("mengembalikan 1 bila total 0 (PDF belum termuat)", () => {
    expect(clampPage(1, 0)).toBe(1);
    expect(clampPage(5, 0)).toBe(1);
  });

  it("halaman pertama dan terakhir tetap valid", () => {
    expect(clampPage(1, 12)).toBe(1);
    expect(clampPage(12, 12)).toBe(12);
  });
});
