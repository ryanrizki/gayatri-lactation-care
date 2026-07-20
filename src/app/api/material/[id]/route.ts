import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canAccessMaterial } from "@/lib/access";
import { resolveExisting, contentTypeFor } from "@/lib/uploads";
import { streamFile } from "@/lib/serve-file";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const mat = await prisma.material.findUnique({ where: { id }, include: { module: true } });
  if (!mat?.filePath) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });

  if (
    !(await canAccessMaterial({
      isPreview: mat.isPreview,
      module: { serviceId: mat.module.serviceId, isPreview: mat.module.isPreview },
    }))
  ) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  const abs = resolveExisting(mat.filePath);
  if (!abs) return NextResponse.json({ error: "File hilang." }, { status: 404 });

  return streamFile(abs, request.headers.get("range"), contentTypeFor(mat.filePath));
}
