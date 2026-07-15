/** Format a number as Indonesian Rupiah, e.g. 350000 → "Rp 350.000". */
export function formatIDR(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}
