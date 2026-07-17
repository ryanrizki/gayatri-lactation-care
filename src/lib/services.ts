import { prisma } from "./db";
import type { ServicePackage } from "@/types";

function toPackage(row: {
  id: string;
  name: string;
  category: "consultation" | "class";
  price: number;
  description: string;
  features: string[];
  image: string;
  materials: unknown;
}): ServicePackage {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    description: row.description,
    features: row.features,
    image: row.image,
    materials: (row.materials as ServicePackage["materials"]) ?? undefined,
  };
}

/** Semua layanan aktif, urut sortOrder. */
export async function getServices(): Promise<ServicePackage[]> {
  const rows = await prisma.service.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  return rows.map(toPackage);
}

/** Satu layanan by id, atau null. */
export async function getService(id: string): Promise<ServicePackage | null> {
  const row = await prisma.service.findFirst({ where: { id, active: true } });
  return row ? toPackage(row) : null;
}

/** Id semua layanan aktif — untuk generateStaticParams. */
export async function getServiceIds(): Promise<string[]> {
  const rows = await prisma.service.findMany({ where: { active: true }, select: { id: true } });
  return rows.map((r) => r.id);
}
