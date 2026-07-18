"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import {
  validateModuleInput,
  validateMaterialInput,
  createModule,
  updateModule,
  deleteModule,
  moveModule,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  moveMaterial,
  type ModuleInput,
  type MaterialInput,
} from "@/lib/modules-admin";

function parseModule(formData: FormData): ModuleInput {
  const durRaw = formData.get("durationSec");
  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    isPreview: formData.get("isPreview") === "on" || formData.get("isPreview") === "true",
    durationSec: durRaw ? Number(durRaw) : null,
    videoPath: (formData.get("videoPath") as string) || null,
  };
}

function parseMaterial(formData: FormData): MaterialInput {
  return {
    title: String(formData.get("title") ?? ""),
    type: String(formData.get("type") ?? "PDF"),
    isPreview: formData.get("isPreview") === "on" || formData.get("isPreview") === "true",
    filePath: (formData.get("filePath") as string) || null,
  };
}

export async function createModuleAction(
  serviceId: string,
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();
  const input = parseModule(formData);
  const v = validateModuleInput(input);
  if (!v.ok) return { error: v.error };
  await createModule(serviceId, input);
  revalidatePath(`/admin/layanan/${serviceId}/modul`);
  return {};
}

export async function updateModuleAction(
  id: string,
  serviceId: string,
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();
  const input = parseModule(formData);
  const v = validateModuleInput(input);
  if (!v.ok) return { error: v.error };
  await updateModule(id, input);
  revalidatePath(`/admin/layanan/${serviceId}/modul`);
  revalidatePath(`/admin/layanan/${serviceId}/modul/${id}`);
  return {};
}

export async function deleteModuleAction(id: string, serviceId: string) {
  await requireAdmin();
  await deleteModule(id);
  revalidatePath(`/admin/layanan/${serviceId}/modul`);
}

export async function moveModuleAction(id: string, serviceId: string, direction: "up" | "down") {
  await requireAdmin();
  await moveModule(id, direction);
  revalidatePath(`/admin/layanan/${serviceId}/modul`);
}

export async function createMaterialAction(
  moduleId: string,
  serviceId: string,
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();
  const input = parseMaterial(formData);
  const v = validateMaterialInput(input);
  if (!v.ok) return { error: v.error };
  await createMaterial(moduleId, input);
  revalidatePath(`/admin/layanan/${serviceId}/modul/${moduleId}`);
  return {};
}

export async function updateMaterialAction(
  id: string,
  moduleId: string,
  serviceId: string,
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();
  const input = parseMaterial(formData);
  const v = validateMaterialInput(input);
  if (!v.ok) return { error: v.error };
  await updateMaterial(id, input);
  revalidatePath(`/admin/layanan/${serviceId}/modul/${moduleId}`);
  return {};
}

export async function deleteMaterialAction(id: string, moduleId: string, serviceId: string) {
  await requireAdmin();
  await deleteMaterial(id);
  revalidatePath(`/admin/layanan/${serviceId}/modul/${moduleId}`);
}

export async function moveMaterialAction(
  id: string,
  moduleId: string,
  serviceId: string,
  direction: "up" | "down",
) {
  await requireAdmin();
  await moveMaterial(id, direction);
  revalidatePath(`/admin/layanan/${serviceId}/modul/${moduleId}`);
}
