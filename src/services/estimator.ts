export interface EstimateResult {
  serviceName: string;
  basePrice: number;
  transportFee: number;
  total: number;
  currency: "IDR";
}

/** Harga dasar layanan. Fase 2 memindahkan ini ke database. */
const BASE_PRICES: Record<string, { name: string; price: number }> = {
  laktasi_homecare: { name: "Konsultasi Laktasi Homecare", price: 350000 },
  laktasi_klinik: { name: "Konsultasi Laktasi Klinik", price: 250000 },
  kelas_bekerja: { name: "Private Class Persiapan Bekerja", price: 400000 },
  kelas_menyusui: { name: "Private Class Persiapan Menyusui", price: 300000 },
};

const FREE_RADIUS_KM = 5;
const FEE_PER_KM = 6000;
const BASE_TRANSPORT_FEE = 15000;

/** Hitung estimasi tarif. Mengembalikan null jika paket tidak dikenal. */
export function calculateEstimate(
  packageId: string,
  locationDistance: number,
  isHomecare: boolean,
): EstimateResult | null {
  const selected = BASE_PRICES[packageId];
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
