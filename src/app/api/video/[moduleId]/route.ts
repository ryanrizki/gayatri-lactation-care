import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { getModule } from "@/lib/modules-admin";
import { resolveExisting, contentTypeFor } from "@/lib/uploads";
import { streamFile } from "@/lib/serve-file";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  const { moduleId } = await params;
  const mod = await getModule(moduleId);
  if (!mod?.videoPath) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });

  const abs = resolveExisting(mod.videoPath);
  if (!abs) return NextResponse.json({ error: "File hilang." }, { status: 404 });

  return streamFile(abs, request.headers.get("range"), contentTypeFor(mod.videoPath));
}
