import { prisma } from "./db";

export interface ModuleInput {
  title: string;
  description: string;
  isPreview: boolean;
  durationSec?: number | null;
  videoPath?: string | null;
}

export interface MaterialInput {
  title: string;
  type: string; // "PDF" | "VIDEO" | "LINK"
  isPreview: boolean;
  filePath?: string | null;
}

export function validateModuleInput(input: ModuleInput): { ok: true } | { ok: false; error: string } {
  if (!input.title?.trim()) return { ok: false, error: "Judul modul wajib diisi." };
  if (input.title.length > 200) return { ok: false, error: "Judul terlalu panjang (maks 200)." };
  if (input.durationSec != null && (!Number.isInteger(input.durationSec) || input.durationSec < 0))
    return { ok: false, error: "Durasi harus bilangan bulat ≥ 0." };
  return { ok: true };
}

export function validateMaterialInput(input: MaterialInput): { ok: true } | { ok: false; error: string } {
  if (!input.title?.trim()) return { ok: false, error: "Judul materi wajib diisi." };
  if (!["PDF", "VIDEO", "LINK"].includes(input.type)) return { ok: false, error: "Tipe materi tidak valid." };
  return { ok: true };
}

/** Modul + materi untuk satu layanan, urut sortOrder. */
export async function getModulesForService(serviceId: string) {
  return prisma.module.findMany({
    where: { serviceId },
    orderBy: { sortOrder: "asc" },
    include: { materials: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getModule(id: string) {
  return prisma.module.findUnique({ where: { id }, include: { materials: { orderBy: { sortOrder: "asc" } } } });
}

export async function createModule(serviceId: string, input: ModuleInput) {
  const count = await prisma.module.count({ where: { serviceId } });
  return prisma.module.create({
    data: {
      serviceId,
      title: input.title.trim(),
      description: input.description ?? "",
      isPreview: input.isPreview,
      durationSec: input.durationSec ?? null,
      videoPath: input.videoPath ?? null,
      sortOrder: count, // taruh di akhir
    },
  });
}

export async function updateModule(id: string, input: ModuleInput) {
  return prisma.module.update({
    where: { id },
    data: {
      title: input.title.trim(),
      description: input.description ?? "",
      isPreview: input.isPreview,
      durationSec: input.durationSec ?? null,
      videoPath: input.videoPath ?? null,
    },
  });
}

export async function deleteModule(id: string) {
  return prisma.module.delete({ where: { id } }); // cascade hapus materi
}

/** Tukar sortOrder modul dengan tetangga (up/down). */
export async function moveModule(id: string, direction: "up" | "down") {
  const mod = await prisma.module.findUnique({ where: { id } });
  if (!mod) return;
  const neighbor = await prisma.module.findFirst({
    where: {
      serviceId: mod.serviceId,
      sortOrder: direction === "up" ? { lt: mod.sortOrder } : { gt: mod.sortOrder },
    },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;
  await prisma.$transaction([
    prisma.module.update({ where: { id: mod.id }, data: { sortOrder: neighbor.sortOrder } }),
    prisma.module.update({ where: { id: neighbor.id }, data: { sortOrder: mod.sortOrder } }),
  ]);
}

// Material CRUD — pola serupa
export async function createMaterial(moduleId: string, input: MaterialInput) {
  const count = await prisma.material.count({ where: { moduleId } });
  return prisma.material.create({
    data: {
      moduleId,
      title: input.title.trim(),
      type: input.type as "PDF" | "VIDEO" | "LINK",
      isPreview: input.isPreview,
      filePath: input.filePath ?? null,
      sortOrder: count,
    },
  });
}

export async function updateMaterial(id: string, input: MaterialInput) {
  return prisma.material.update({
    where: { id },
    data: {
      title: input.title.trim(),
      type: input.type as "PDF" | "VIDEO" | "LINK",
      isPreview: input.isPreview,
      filePath: input.filePath ?? null,
    },
  });
}

export async function deleteMaterial(id: string) {
  return prisma.material.delete({ where: { id } });
}

export async function moveMaterial(id: string, direction: "up" | "down") {
  const mat = await prisma.material.findUnique({ where: { id } });
  if (!mat) return;
  const neighbor = await prisma.material.findFirst({
    where: {
      moduleId: mat.moduleId,
      sortOrder: direction === "up" ? { lt: mat.sortOrder } : { gt: mat.sortOrder },
    },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;
  await prisma.$transaction([
    prisma.material.update({ where: { id: mat.id }, data: { sortOrder: neighbor.sortOrder } }),
    prisma.material.update({ where: { id: neighbor.id }, data: { sortOrder: mat.sortOrder } }),
  ]);
}
