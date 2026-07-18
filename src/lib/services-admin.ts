import { prisma } from "./db";
import { slugify } from "./slug";

export interface ServiceInput {
  name: string;
  category: string; // "consultation" | "class"
  price: number;
  description: string;
  features: string[];
  image: string;
  sortOrder?: number;
  active?: boolean;
}

export function validateServiceInput(input: ServiceInput): { ok: true } | { ok: false; error: string } {
  if (!input.name?.trim()) return { ok: false, error: "Nama layanan wajib diisi." };
  if (input.name.length > 160) return { ok: false, error: "Nama terlalu panjang (maks 160 karakter)." };
  if (!["consultation", "class"].includes(input.category)) return { ok: false, error: "Kategori tidak valid." };
  if (!Number.isInteger(input.price) || input.price < 0) return { ok: false, error: "Harga harus bilangan bulat ≥ 0." };
  if (!input.description?.trim()) return { ok: false, error: "Deskripsi wajib diisi." };
  return { ok: true };
}

/** id unik dari slug nama; tambah sufiks angka bila bentrok. */
export async function generateUniqueServiceId(name: string): Promise<string> {
  const base = slugify(name) || "layanan";
  let id = base;
  let n = 1;
  while (await prisma.service.findUnique({ where: { id } })) {
    n += 1;
    id = `${base}-${n}`;
  }
  return id;
}

export async function getAllServices() {
  return prisma.service.findMany({ orderBy: { sortOrder: "asc" } }); // termasuk nonaktif
}

export async function getServiceForEdit(id: string) {
  return prisma.service.findUnique({ where: { id } });
}

export async function createServiceRecord(input: ServiceInput) {
  const id = await generateUniqueServiceId(input.name);
  return prisma.service.create({
    data: {
      id,
      name: input.name.trim(),
      category: input.category as "consultation" | "class",
      price: input.price,
      description: input.description,
      features: input.features.filter((f) => f.trim()),
      image: input.image,
      sortOrder: input.sortOrder ?? 0,
      active: input.active ?? true,
    },
  });
}

export async function updateServiceRecord(id: string, input: ServiceInput) {
  return prisma.service.update({
    where: { id },
    data: {
      name: input.name.trim(),
      category: input.category as "consultation" | "class",
      price: input.price,
      description: input.description,
      features: input.features.filter((f) => f.trim()),
      image: input.image,
      sortOrder: input.sortOrder ?? 0,
      active: input.active ?? true,
    },
  });
}

export async function setServiceActive(id: string, active: boolean) {
  return prisma.service.update({ where: { id }, data: { active } });
}
