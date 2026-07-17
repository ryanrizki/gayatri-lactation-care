import type { EstimatorConfig } from "@/lib/settings";

export interface EstimateResult {
  serviceName: string;
  basePrice: number;
  transportFee: number;
  total: number;
  currency: "IDR";
}

/** Hitung estimasi tarif atas satu service + konfigurasi tarif. null jika service tak ada. */
export function calculateEstimate(
  service: { name: string; price: number } | null | undefined,
  config: EstimatorConfig,
  locationDistance: number,
  isHomecare: boolean,
): EstimateResult | null {
  if (!service) return null;

  let transportFee = 0;
  if (isHomecare) {
    transportFee =
      locationDistance > config.freeRadiusKm
        ? Math.round((locationDistance - config.freeRadiusKm) * config.feePerKm)
        : config.baseTransportFee;
  }

  return {
    serviceName: service.name,
    basePrice: service.price,
    transportFee,
    total: service.price + transportFee,
    currency: "IDR",
  };
}
