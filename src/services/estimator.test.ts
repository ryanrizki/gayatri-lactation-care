import { describe, it, expect } from "vitest";
import { calculateEstimate } from "./estimator";
import type { EstimatorConfig } from "@/lib/settings";

const CONFIG: EstimatorConfig = { freeRadiusKm: 5, feePerKm: 6000, baseTransportFee: 15000 };
const HOMECARE = { name: "Konsultasi Laktasi Homecare", price: 350000 };
const KLINIK = { name: "Konsultasi Laktasi Klinik", price: 250000 };

describe("calculateEstimate", () => {
  it("mengembalikan null untuk service null", () => {
    expect(calculateEstimate(null, CONFIG, 0, false)).toBeNull();
  });

  it("tanpa homecare: total = harga dasar, transport 0", () => {
    expect(calculateEstimate(KLINIK, CONFIG, 0, false)).toEqual({
      serviceName: "Konsultasi Laktasi Klinik",
      basePrice: 250000,
      transportFee: 0,
      total: 250000,
      currency: "IDR",
    });
  });

  it("homecare di dalam radius: transport flat baseTransportFee", () => {
    const r = calculateEstimate(HOMECARE, CONFIG, 3, true);
    expect(r?.transportFee).toBe(15000);
    expect(r?.total).toBe(350000 + 15000);
  });

  it("homecare tepat di radius bebas: masih flat (batas inklusif)", () => {
    expect(calculateEstimate(HOMECARE, CONFIG, 5, true)?.transportFee).toBe(15000);
  });

  it("homecare di atas radius: (jarak - freeRadius) x feePerKm", () => {
    const r = calculateEstimate(HOMECARE, CONFIG, 10, true);
    expect(r?.transportFee).toBe(30000);
    expect(r?.total).toBe(350000 + 30000);
  });

  it("mengabaikan jarak saat isHomecare false", () => {
    expect(calculateEstimate(KLINIK, CONFIG, 30, false)?.transportFee).toBe(0);
  });

  it("membulatkan transport untuk jarak pecahan", () => {
    // (6.3333 - 5) * 6000 = 7999.8 -> 8000
    const r = calculateEstimate(HOMECARE, CONFIG, 6.3333, true);
    expect(r?.transportFee).toBe(8000);
    expect(r?.total).toBe(350000 + 8000);
  });
});
