import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/lib/require-admin";
import {
  validateUpload,
  ensureSubdir,
  randomFilename,
  UPLOAD_LIMITS,
  type UploadKind,
} from "@/lib/uploads";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  const kind = request.nextUrl.searchParams.get("kind") as UploadKind | null;
  const filename = request.nextUrl.searchParams.get("filename") ?? "";
  const mime = request.headers.get("content-type") ?? "";
  const declaredSize = Number(request.headers.get("content-length") ?? "0");

  if (!kind) return NextResponse.json({ error: "kind wajib." }, { status: 400 });

  // Validasi awal (tipe/ekstensi + ukuran dari content-length bila ada).
  const v = validateUpload(kind, mime.split(";")[0].trim(), filename, declaredSize || 0);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: v.status });

  if (!request.body) return NextResponse.json({ error: "Body kosong." }, { status: 400 });

  const limit = kind === "video" ? UPLOAD_LIMITS.video : UPLOAD_LIMITS.material;
  const dir = ensureSubdir(v.subdir);
  const name = randomFilename(v.ext);
  const abs = path.join(dir, name);
  const relPath = `${v.subdir}/${name}`;

  const ws = fs.createWriteStream(abs);
  let written = 0;
  try {
    const reader = request.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      written += value.byteLength;
      if (written > limit) {
        ws.destroy();
        await fs.promises.unlink(abs).catch(() => {});
        return NextResponse.json({ error: "Ukuran file melebihi batas." }, { status: 413 });
      }
      // tulis chunk, tunggu drain bila perlu
      if (!ws.write(value)) {
        await new Promise<void>((res) => ws.once("drain", res));
      }
    }
    await new Promise<void>((res, rej) => ws.end((err?: Error) => (err ? rej(err) : res())));
  } catch {
    ws.destroy();
    await fs.promises.unlink(abs).catch(() => {});
    return NextResponse.json({ error: "Gagal menyimpan file." }, { status: 500 });
  }

  return NextResponse.json({ path: relPath, size: written, filename });
}
