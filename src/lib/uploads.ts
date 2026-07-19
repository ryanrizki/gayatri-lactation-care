import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const UPLOAD_LIMITS = {
  video: 500 * 1024 * 1024, // 500MB
  material: 20 * 1024 * 1024, // 20MB
} as const;

const ALLOWED: Record<string, { mimes: string[]; exts: string[]; subdir: string }> = {
  video: { mimes: ["video/mp4", "video/webm"], exts: [".mp4", ".webm"], subdir: "videos" },
  material: { mimes: ["application/pdf"], exts: [".pdf"], subdir: "materials" },
};

export function uploadRoot(): string {
  return process.env.UPLOAD_DIR || "./uploads";
}

export type UploadKind = "video" | "material";

export function validateUpload(
  kind: UploadKind,
  mime: string,
  filename: string,
  size: number,
): { ok: true; ext: string; subdir: string } | { ok: false; error: string; status: number } {
  const cfg = ALLOWED[kind];
  if (!cfg) return { ok: false, error: "Jenis unggahan tidak dikenal.", status: 400 };
  const ext = path.extname(filename).toLowerCase();
  if (!cfg.mimes.includes(mime) || !cfg.exts.includes(ext)) {
    return { ok: false, error: `Tipe file tidak diizinkan untuk ${kind}.`, status: 415 };
  }
  const limit = kind === "video" ? UPLOAD_LIMITS.video : UPLOAD_LIMITS.material;
  if (size > limit) return { ok: false, error: "Ukuran file melebihi batas.", status: 413 };
  return { ok: true, ext, subdir: cfg.subdir };
}

export function parseRange(
  header: string | undefined,
  fileSize: number,
): { start: number; end: number } | null {
  if (!header) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m) return null;
  const [, s, e] = m;
  if (s === "" && e === "") return null;
  let start = s === "" ? fileSize - Number(e) : Number(s);
  let end = e === "" ? fileSize - 1 : Number(e);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  start = Math.max(0, start);
  end = Math.min(end, fileSize - 1);
  if (start > end) return null;
  return { start, end };
}

/** Nama internal aman? (tak keluar dari root). */
export function isSafeUploadName(name: string): boolean {
  if (name.includes("..")) return false;
  const resolved = path.resolve(uploadRoot(), name);
  const root = path.resolve(uploadRoot());
  return resolved.startsWith(root + path.sep);
}

export function randomFilename(ext: string): string {
  return `${randomUUID()}${ext}`;
}

export function ensureSubdir(subdir: string): string {
  const dir = path.join(uploadRoot(), subdir);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** Resolve path absolut file internal, atau null bila tak aman/tak ada. */
export function resolveExisting(relPath: string): string | null {
  if (!isSafeUploadName(relPath)) return null;
  const abs = path.resolve(uploadRoot(), relPath);
  return fs.existsSync(abs) ? abs : null;
}

export function contentTypeFor(relPath: string): string {
  const ext = path.extname(relPath).toLowerCase();
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".webm") return "video/webm";
  if (ext === ".pdf") return "application/pdf";
  return "application/octet-stream";
}
