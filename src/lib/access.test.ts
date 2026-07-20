import { describe, it, expect } from "vitest";
import { decideAccess } from "./access";

describe("decideAccess", () => {
  it("admin selalu boleh", () => {
    expect(decideAccess({ role: "ADMIN", isPreview: false, hasPaid: false })).toBe(true);
  });
  it("modul preview boleh tanpa bayar/login", () => {
    expect(decideAccess({ role: null, isPreview: true, hasPaid: false })).toBe(true);
  });
  it("user PAID boleh", () => {
    expect(decideAccess({ role: "USER", isPreview: false, hasPaid: true })).toBe(true);
  });
  it("user non-PAID non-preview ditolak", () => {
    expect(decideAccess({ role: "USER", isPreview: false, hasPaid: false })).toBe(false);
  });
  it("anon non-preview ditolak", () => {
    expect(decideAccess({ role: null, isPreview: false, hasPaid: false })).toBe(false);
  });
});
