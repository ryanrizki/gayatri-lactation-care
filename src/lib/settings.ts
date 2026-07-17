import { prisma } from "./db";

export interface EstimatorConfig {
  freeRadiusKm: number;
  feePerKm: number;
  baseTransportFee: number;
}

const FALLBACK: EstimatorConfig = { freeRadiusKm: 5, feePerKm: 6000, baseTransportFee: 15000 };

/** Ambil konfigurasi tarif estimator dari Setting; fallback ke default bila belum ada. */
export async function getEstimatorConfig(): Promise<EstimatorConfig> {
  const row = await prisma.setting.findUnique({ where: { key: "estimator" } });
  if (!row) return FALLBACK;
  return { ...FALLBACK, ...(row.value as Partial<EstimatorConfig>) };
}
