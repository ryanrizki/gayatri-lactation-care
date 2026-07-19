import { describe, it, expect } from "vitest";
import { resolveEnrollmentRequest } from "./enrollments";

describe("resolveEnrollmentRequest", () => {
  it("belum ada → buat PENDING baru", () => {
    expect(resolveEnrollmentRequest(null)).toBe("create");
  });
  it("PENDING → biarkan (idempoten)", () => {
    expect(resolveEnrollmentRequest("PENDING")).toBe("keep");
  });
  it("PAID → biarkan (sudah punya akses)", () => {
    expect(resolveEnrollmentRequest("PAID")).toBe("keep");
  });
  it("CANCELLED → reset ke PENDING", () => {
    expect(resolveEnrollmentRequest("CANCELLED")).toBe("reset");
  });
});
