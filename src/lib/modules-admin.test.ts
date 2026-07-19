import { describe, it, expect } from "vitest";
import { validateModuleInput, validateMaterialInput } from "./modules-admin";

describe("validateModuleInput", () => {
  it("menerima judul valid", () => {
    expect(validateModuleInput({ title: "Modul 1", description: "", isPreview: false }).ok).toBe(true);
  });
  it("menolak judul kosong", () => {
    expect(validateModuleInput({ title: "  ", description: "", isPreview: false }).ok).toBe(false);
  });
  it("menolak judul terlalu panjang", () => {
    expect(validateModuleInput({ title: "x".repeat(201), description: "", isPreview: false }).ok).toBe(false);
  });
});

describe("validateMaterialInput", () => {
  it("menerima materi valid", () => {
    expect(validateMaterialInput({ title: "PDF 1", type: "PDF", isPreview: false }).ok).toBe(true);
  });
  it("menolak tipe tak dikenal", () => {
    expect(validateMaterialInput({ title: "x", type: "MP3", isPreview: false }).ok).toBe(false);
  });
  it("menolak judul kosong", () => {
    expect(validateMaterialInput({ title: "", type: "PDF", isPreview: false }).ok).toBe(false);
  });
});
