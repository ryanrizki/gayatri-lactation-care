"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import {
  validateServiceInput,
  createServiceRecord,
  updateServiceRecord,
  setServiceActive,
  type ServiceInput,
} from "@/lib/services-admin";

function parseServiceForm(formData: FormData): ServiceInput {
  return {
    name: String(formData.get("name") ?? ""),
    category: String(formData.get("category") ?? ""),
    price: Number(formData.get("price") ?? 0),
    description: String(formData.get("description") ?? ""),
    features: formData.getAll("features").map(String).filter((f) => f.trim()),
    image: String(formData.get("image") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    active: formData.get("active") === "on" || formData.get("active") === "true",
  };
}

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/layanan");
  revalidatePath("/admin/layanan");
}

export async function createService(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();
  const input = parseServiceForm(formData);
  const v = validateServiceInput(input);
  if (!v.ok) return { error: v.error };
  await createServiceRecord(input);
  revalidatePublic();
  redirect("/admin/layanan");
}

export async function updateService(
  id: string,
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();
  const input = parseServiceForm(formData);
  const v = validateServiceInput(input);
  if (!v.ok) return { error: v.error };
  await updateServiceRecord(id, input);
  revalidatePublic();
  revalidatePath(`/layanan/${id}`);
  redirect("/admin/layanan");
}

export async function toggleServiceActive(id: string, active: boolean) {
  await requireAdmin();
  await setServiceActive(id, active);
  revalidatePublic();
  revalidatePath(`/layanan/${id}`);
}

export async function updateEstimatorConfig(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  await requireAdmin();
  const freeRadiusKm = Number(formData.get("freeRadiusKm"));
  const feePerKm = Number(formData.get("feePerKm"));
  const baseTransportFee = Number(formData.get("baseTransportFee"));
  for (const [k, v] of [
    ["Radius bebas", freeRadiusKm],
    ["Tarif per km", feePerKm],
    ["Biaya dasar", baseTransportFee],
  ] as const) {
    if (!Number.isFinite(v) || v < 0) return { error: `${k} harus angka ≥ 0.` };
  }
  await prisma.setting.upsert({
    where: { key: "estimator" },
    update: { value: { freeRadiusKm, feePerKm, baseTransportFee } },
    create: { key: "estimator", value: { freeRadiusKm, feePerKm, baseTransportFee } },
  });
  revalidatePath("/layanan");
  return { ok: true };
}
