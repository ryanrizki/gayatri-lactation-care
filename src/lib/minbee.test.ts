import { describe, it, expect } from "vitest";
import { MINBEE_SYSTEM_INSTRUCTION, MINBEE_FALLBACK_TEXT } from "./minbee";

describe("konstanta Minbee", () => {
  it("system instruction menyebut identitas dan sapaan Mama", () => {
    expect(MINBEE_SYSTEM_INSTRUCTION).toContain("Minbee");
    expect(MINBEE_SYSTEM_INSTRUCTION).toContain("Gayatri Lactation Care");
    expect(MINBEE_SYSTEM_INSTRUCTION).toContain("Mama");
  });

  it("teks fallback menjelaskan API key belum terkonfigurasi", () => {
    expect(MINBEE_FALLBACK_TEXT).toContain("GEMINI_API_KEY");
    expect(MINBEE_FALLBACK_TEXT).toContain("Mama");
  });
});
