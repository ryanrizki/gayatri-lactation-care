import { prisma } from "./db";

// Lazy-load auth inside the request-time helpers so this module's pure
// `decideAccess` can be unit-tested without pulling in the next-auth stack.
async function currentSession() {
  const { auth } = await import("@/auth");
  return auth();
}

/** Keputusan akses murni. */
export function decideAccess(ctx: {
  role: "ADMIN" | "USER" | null;
  isPreview: boolean;
  hasPaid: boolean;
}): boolean {
  if (ctx.role === "ADMIN") return true;
  if (ctx.isPreview) return true;
  return ctx.hasPaid;
}

export async function hasPaidEnrollment(userId: string, serviceId: string): Promise<boolean> {
  const e = await prisma.enrollment.findUnique({
    where: { userId_serviceId: { userId, serviceId } },
  });
  return e?.status === "PAID";
}

/** Cek akses ke sebuah modul untuk sesi saat ini. */
export async function canAccessModule(module: {
  serviceId: string;
  isPreview: boolean;
}): Promise<boolean> {
  const session = await currentSession();
  const role = (session?.user?.role as "ADMIN" | "USER" | undefined) ?? null;
  if (role === "ADMIN") return true;
  if (module.isPreview) return true;
  const userId = session?.user?.id;
  if (!userId) return false;
  return hasPaidEnrollment(userId, module.serviceId);
}

/** Materi mewarisi akses modul induknya (atau materi preview). */
export async function canAccessMaterial(material: {
  isPreview: boolean;
  module: { serviceId: string; isPreview: boolean };
}): Promise<boolean> {
  const session = await currentSession();
  const role = (session?.user?.role as "ADMIN" | "USER" | undefined) ?? null;
  if (role === "ADMIN") return true;
  if (material.isPreview || material.module.isPreview) return true;
  const userId = session?.user?.id;
  if (!userId) return false;
  return hasPaidEnrollment(userId, material.module.serviceId);
}

/** Kelas (service) yang user beli & PAID, + data service. */
export async function getPaidEnrollments(userId: string) {
  return prisma.enrollment.findMany({
    where: { userId, status: "PAID" },
    orderBy: { confirmedAt: "desc" },
    include: { service: true },
  });
}
