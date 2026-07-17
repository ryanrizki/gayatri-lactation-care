import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing (argon2id)", () => {
  it("hash lalu verify cocok", async () => {
    const hash = await hashPassword("RahasiaMama123");
    expect(hash).not.toBe("RahasiaMama123");
    expect(await verifyPassword("RahasiaMama123", hash)).toBe(true);
  });

  it("password salah tidak verify", async () => {
    const hash = await hashPassword("RahasiaMama123");
    expect(await verifyPassword("salah", hash)).toBe(false);
  });

  it("dua hash dari password sama berbeda (salted)", async () => {
    const a = await hashPassword("sama");
    const b = await hashPassword("sama");
    expect(a).not.toBe(b);
  });
});
