/** Clamp a page number into [1, total]. Returns 1 when total is 0 (PDF not yet loaded). */
export function clampPage(page: number, total: number): number {
  const max = Math.max(1, total);
  if (page < 1) return 1;
  if (page > max) return max;
  return page;
}
