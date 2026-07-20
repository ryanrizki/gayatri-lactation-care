import { NextRequest, NextResponse } from "next/server";
import { getModule } from "@/lib/modules-admin";
import { canAccessModule } from "@/lib/access";
import { resolveExisting, contentTypeFor } from "@/lib/uploads";
import { streamFile } from "@/lib/serve-file";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  const { moduleId } = await params;
  const mod = await getModule(moduleId);
  if (!mod?.videoPath) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });

  if (!(await canAccessModule({ serviceId: mod.serviceId, isPreview: mod.isPreview }))) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  const abs = resolveExisting(mod.videoPath);
  if (!abs) return NextResponse.json({ error: "File hilang." }, { status: 404 });

  return streamFile(abs, request.headers.get("range"), contentTypeFor(mod.videoPath));
}
