import { findPackage } from "./serviceConfig";

export interface EstimateResult {
  serviceName: string;
  basePrice: number;
  transportFee: number;
  total: number;
  currency: "IDR";
}

/** Tarif transport. Fase 2 memindahkan konstanta ini ke tabel Setting. */
const FREE_RADIUS_KM = 5;
const FEE_PER_KM = 6000;
const BASE_TRANSPORT_FEE = 15000;

/** Hitung estimasi tarif. Mengembalikan null jika paket tidak dikenal. */
export function calculateEstimate(
  packageId: string,
  locationDistance: number,
  isHomecare: boolean,
): EstimateResult | null {
  const selected = findPackage(packageId);
  if (!selected) return null;

  let transportFee = 0;
  if (isHomecare) {
    transportFee =
      locationDistance > FREE_RADIUS_KM
        ? Math.round((locationDistance - FREE_RADIUS_KM) * FEE_PER_KM)
        : BASE_TRANSPORT_FEE;
  }

  return {
    serviceName: selected.name,
    basePrice: selected.price,
    transportFee,
    total: selected.price + transportFee,
    currency: "IDR",
  };
}
