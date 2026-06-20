import { useState, useEffect } from "react";

export interface EstimateData {
  serviceName: string;
  basePrice: number;
  transportFee: number;
  total: number;
  currency: string;
}

/** Fetch a transparent fee estimate from POST /api/estimator. */
export function useEstimate(packageId: string, isHomecare: boolean, distanceKm: number) {
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/estimator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageId, locationDistance: distanceKm, isHomecare }),
        });
        if (res.ok && !cancelled) setEstimate(await res.json());
      } catch (err) {
        console.error("Gagal memuat estimasi tarif", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [packageId, isHomecare, distanceKm]);

  return { estimate, loading };
}
