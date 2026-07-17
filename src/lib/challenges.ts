import { prisma } from "./db";
import type { BreastfeedingChallenge } from "@/types";

/** Semua challenge, urut sortOrder. */
export async function getChallenges(): Promise<BreastfeedingChallenge[]> {
  const rows = await prisma.challenge.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    icon: r.icon,
    description: r.description,
    criticalSymptoms: r.criticalSymptoms,
    immediateSteps: r.immediateSteps,
    interactiveDiagnostic: r.interactiveDiagnostic as unknown as BreastfeedingChallenge["interactiveDiagnostic"],
  }));
}
