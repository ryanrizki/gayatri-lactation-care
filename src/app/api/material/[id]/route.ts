import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/db";
import { resolveExisting, contentTypeFor } from "@/lib/uploads";
import { streamFile } from "@/lib/serve-file";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  const { id } = await params;
  const mat = await prisma.material.findUnique({ where: { id } });
  if (!mat?.filePath) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });

  const abs = resolveExisting(mat.filePath);
  if (!abs) return NextResponse.json({ error: "File hilang." }, { status: 404 });

  return streamFile(abs, request.headers.get("range"), contentTypeFor(mat.filePath));
}
