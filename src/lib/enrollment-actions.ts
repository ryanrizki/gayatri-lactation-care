"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/db";
import { requestEnrollment, setEnrollmentStatus } from "@/lib/enrollments";

/** Aksi USER: request akses kelas. userId dari sesi (BUKAN input). */
export async function buyClassAction(serviceId: string): Promise<{ error?: string; status?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Silakan masuk dulu ya, Ma." };
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || service.category !== "class") return { error: "Layanan tidak valid." };
  const enrollment = await requestEnrollment(session.user.id, serviceId);
  revalidatePath(`/layanan/${serviceId}/booking`);
  return { status: enrollment.status };
}

export async function confirmEnrollmentAction(id: string) {
  await requireAdmin();
  const session = await auth();
  await setEnrollmentStatus(id, "PAID", session?.user?.id);
  revalidatePath("/admin/enrollment");
  revalidatePath("/admin");
}

export async function cancelEnrollmentAction(id: string) {
  await requireAdmin();
  await setEnrollmentStatus(id, "CANCELLED");
  revalidatePath("/admin/enrollment");
  revalidatePath("/admin");
}

export async function updatePaymentSettingsAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  await requireAdmin();
  const value = {
    bankName: String(formData.get("bankName") ?? "").trim(),
    accountNumber: String(formData.get("accountNumber") ?? "").trim(),
    accountHolder: String(formData.get("accountHolder") ?? "").trim(),
    whatsapp: String(formData.get("whatsapp") ?? "").trim().replace(/[^0-9]/g, ""),
  };
  if (!value.bankName || !value.accountNumber || !value.whatsapp) return { error: "Bank, no rekening, dan WhatsApp wajib." };
  await prisma.setting.upsert({ where: { key: "payment" }, update: { value }, create: { key: "payment", value } });
  revalidatePath("/admin/pengaturan");
  return { ok: true };
}
