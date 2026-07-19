import { prisma } from "./db";

export type EnrollStatus = "PENDING" | "PAID" | "CANCELLED";

/** Keputusan murni: apa yang dilakukan saat user request enroll, berdasar status existing. */
export function resolveEnrollmentRequest(existing: EnrollStatus | null): "create" | "keep" | "reset" {
  if (existing === null) return "create";
  if (existing === "CANCELLED") return "reset";
  return "keep"; // PENDING atau PAID
}

export async function getEnrollment(userId: string, serviceId: string) {
  return prisma.enrollment.findUnique({ where: { userId_serviceId: { userId, serviceId } } });
}

/** Idempoten: buat/reset ke PENDING sesuai resolveEnrollmentRequest. Kembalikan enrollment final. */
export async function requestEnrollment(userId: string, serviceId: string) {
  const existing = await getEnrollment(userId, serviceId);
  const decision = resolveEnrollmentRequest((existing?.status as EnrollStatus) ?? null);
  if (decision === "keep") return existing!;
  if (decision === "reset") {
    return prisma.enrollment.update({
      where: { id: existing!.id },
      data: { status: "PENDING", requestedAt: new Date(), confirmedAt: null, confirmedById: null },
    });
  }
  return prisma.enrollment.create({ data: { userId, serviceId, status: "PENDING" } });
}

export async function getEnrollmentsForAdmin(status?: EnrollStatus) {
  return prisma.enrollment.findMany({
    where: status ? { status } : undefined,
    orderBy: { requestedAt: "desc" },
    include: { user: { select: { nama: true, email: true } }, service: { select: { name: true } } },
  });
}

export async function getPendingCount() {
  return prisma.enrollment.count({ where: { status: "PENDING" } });
}

export async function setEnrollmentStatus(id: string, status: EnrollStatus, adminId?: string) {
  return prisma.enrollment.update({
    where: { id },
    data: {
      status,
      confirmedAt: status === "PAID" ? new Date() : null,
      confirmedById: status === "PAID" ? (adminId ?? null) : null,
    },
  });
}
