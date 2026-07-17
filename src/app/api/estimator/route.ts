import { NextResponse } from "next/server";
import { calculateEstimate } from "@/services/estimator";
import { getService } from "@/lib/services";
import { getEstimatorConfig } from "@/lib/settings";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    packageId,
    locationDistance = 0,
    isHomecare = false,
  }: { packageId?: string; locationDistance?: number; isHomecare?: boolean } = body;

  const [service, config] = await Promise.all([
    packageId ? getService(packageId) : Promise.resolve(null),
    getEstimatorConfig(),
  ]);

  const result = calculateEstimate(service, config, locationDistance, isHomecare);
  if (!result) {
    return NextResponse.json({ error: "Layanan tidak ditemukan." }, { status: 400 });
  }
  return NextResponse.json(result);
}
