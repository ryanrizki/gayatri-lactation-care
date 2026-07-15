import { describe, it, expect } from "vitest";
import { calculateEstimate } from "./estimator";

describe("calculateEstimate", () => {
  it("mengembalikan null untuk paket yang tidak dikenal", () => {
    expect(calculateEstimate("paket_hantu", 0, false)).toBeNull();
  });

  it("tanpa homecare: total = harga dasar, transport 0", () => {
    const r = calculateEstimate("laktasi_klinik", 0, false);
    expect(r).toEqual({
      serviceName: "Konsultasi Laktasi Klinik",
      basePrice: 250000,
      transportFee: 0,
      total: 250000,
      currency: "IDR",
    });
  });

  it("homecare di dalam radius 5 km: transport flat 15000", () => {
    const r = calculateEstimate("laktasi_homecare", 3, true);
    expect(r?.transportFee).toBe(15000);
    expect(r?.total).toBe(350000 + 15000);
  });

  it("homecare tepat 5 km: masih flat 15000 (batas inklusif)", () => {
    const r = calculateEstimate("laktasi_homecare", 5, true);
    expect(r?.transportFee).toBe(15000);
  });

  it("homecare di atas 5 km: (jarak - 5) x 6000", () => {
    const r = calculateEstimate("laktasi_homecare", 10, true);
    expect(r?.transportFee).toBe(30000);
    expect(r?.total).toBe(350000 + 30000);
  });

  it("mengabaikan jarak saat isHomecare false", () => {
    const r = calculateEstimate("laktasi_klinik", 30, false);
    expect(r?.transportFee).toBe(0);
  });

  it("membulatkan transport untuk jarak pecahan", () => {
    // (6.3333 - 5) * 6000 = 7999.8 -> Math.round jadi 8000.
    // Math.floor/trunc akan menghasilkan 7999, jadi tes ini mengunci pembulatan.
    const r = calculateEstimate("laktasi_homecare", 6.3333, true);
    expect(r?.transportFee).toBe(8000);
    expect(r?.total).toBe(350000 + 8000);
  });
});
