import { describe, it, expect } from "vitest";
import { validateUpload, parseRange, isSafeUploadName, UPLOAD_LIMITS } from "./uploads";

describe("validateUpload", () => {
  it("terima video mp4 di bawah batas", () => {
    expect(validateUpload("video", "video/mp4", "clip.mp4", 10_000_000).ok).toBe(true);
  });
  it("tolak tipe video tak diizinkan", () => {
    expect(validateUpload("video", "video/avi", "x.avi", 100).ok).toBe(false);
  });
  it("tolak video melebihi 500MB", () => {
    expect(validateUpload("video", "video/mp4", "x.mp4", UPLOAD_LIMITS.video + 1).ok).toBe(false);
  });
  it("terima pdf materi di bawah 20MB", () => {
    expect(validateUpload("material", "application/pdf", "m.pdf", 1_000_000).ok).toBe(true);
  });
  it("tolak pdf melebihi 20MB", () => {
    expect(validateUpload("material", "application/pdf", "m.pdf", UPLOAD_LIMITS.material + 1).ok).toBe(false);
  });
  it("tolak kind tak dikenal", () => {
    expect(validateUpload("other" as never, "application/pdf", "m.pdf", 100).ok).toBe(false);
  });
});

describe("parseRange", () => {
  it("parse bytes=0-1023", () => {
    expect(parseRange("bytes=0-1023", 5000)).toEqual({ start: 0, end: 1023 });
  });
  it("parse bytes=1000- (open end)", () => {
    expect(parseRange("bytes=1000-", 5000)).toEqual({ start: 1000, end: 4999 });
  });
  it("null untuk header kosong/invalid", () => {
    expect(parseRange(undefined, 5000)).toBeNull();
    expect(parseRange("bytes=abc", 5000)).toBeNull();
  });
  it("clamp end ke ukuran file", () => {
    expect(parseRange("bytes=0-99999", 5000)).toEqual({ start: 0, end: 4999 });
  });
});

describe("isSafeUploadName", () => {
  it("terima nama internal wajar", () => {
    expect(isSafeUploadName("videos/abc123.mp4")).toBe(true);
  });
  it("tolak path traversal", () => {
    expect(isSafeUploadName("../../etc/passwd")).toBe(false);
    expect(isSafeUploadName("videos/../../x")).toBe(false);
  });
});
