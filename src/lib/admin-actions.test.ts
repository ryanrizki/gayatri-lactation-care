import { describe, it, expect } from "vitest";
import { slugify } from "./slug";
import { validateServiceInput } from "./services-admin";

describe("slugify", () => {
  it("membuat slug URL-aman", () => {
    expect(slugify("Kelas Pijat Bayi")).toBe("kelas-pijat-bayi");
    expect(slugify("  Konsultasi   ASI!! ")).toBe("konsultasi-asi");
    expect(slugify("Ibu & Anak")).toBe("ibu-anak");
  });
});

describe("validateServiceInput", () => {
  const base = { name: "X", category: "class", price: 1000, description: "d", features: ["a"], image: "http://x/y.jpg" };
  it("menerima input valid", () => { expect(validateServiceInput(base).ok).toBe(true); });
  it("menolak nama kosong", () => { expect(validateServiceInput({ ...base, name: "  " }).ok).toBe(false); });
  it("menolak harga negatif", () => { expect(validateServiceInput({ ...base, price: -1 }).ok).toBe(false); });
  it("menolak harga non-integer", () => { expect(validateServiceInput({ ...base, price: 10.5 }).ok).toBe(false); });
  it("menolak kategori tak dikenal", () => { expect(validateServiceInput({ ...base, category: "xxx" }).ok).toBe(false); });
  it("menolak deskripsi kosong", () => { expect(validateServiceInput({ ...base, description: "" }).ok).toBe(false); });
});
