import { NextResponse } from "next/server";
import { calculateEstimate } from "@/services/estimator";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    packageId,
    locationDistance = 0,
    isHomecare = false,
  }: { packageId?: string; locationDistance?: number; isHomecare?: boolean } = body;

  const result = calculateEstimate(packageId ?? "", locationDistance, isHomecare);
  if (!result) {
    return NextResponse.json({ error: "Layanan tidak ditemukan." }, { status: 400 });
  }

  return NextResponse.json(result);
}
