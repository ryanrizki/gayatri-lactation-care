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

export interface PaymentSettings {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  whatsapp: string; // nomor tanpa +, mis. "6281234567890"
}

const PAYMENT_FALLBACK: PaymentSettings = {
  bankName: "BCA",
  accountNumber: "0000000000",
  accountHolder: "Gayatri Lactation Care",
  whatsapp: "6281234567890",
};

/** Ambil info pembayaran dari Setting; fallback ke placeholder default bila belum ada. */
export async function getPaymentSettings(): Promise<PaymentSettings> {
  const row = await prisma.setting.findUnique({ where: { key: "payment" } });
  if (!row) return PAYMENT_FALLBACK;
  return { ...PAYMENT_FALLBACK, ...(row.value as Partial<PaymentSettings>) };
}
