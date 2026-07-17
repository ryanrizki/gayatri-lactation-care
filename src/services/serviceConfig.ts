import type { ServicePackage } from "@/types";

export type ServiceKind = "homecare" | "klinik" | "class";

/** Resolve a package to its tailored flow kind. */
export function getKind(pkg: ServicePackage): ServiceKind {
  if (pkg.id === "laktasi_homecare") return "homecare";
  if (pkg.id === "laktasi_klinik") return "klinik";
  return "class"; // Kelas digital
}

export interface KindMeta {
  methodLabel: string;     // human label for the delivery method
  usesDistance: boolean;   // show distance slider + transport fee
  usesDatePicker: boolean; // booking shows date + time pickers
  requiresLogin: boolean;  // purchase requires login
  isDigital: boolean;      // digital product (materials + video)
}

export const KIND_META: Record<ServiceKind, KindMeta> = {
  homecare: { methodLabel: "Kunjungan Rumah (Homecare)", usesDistance: true,  usesDatePicker: true,  requiresLogin: false, isDigital: false },
  klinik:   { methodLabel: "Tatap Muka di Klinik",       usesDistance: false, usesDatePicker: true,  requiresLogin: false, isDigital: false },
  class:    { methodLabel: "Kelas Digital",              usesDistance: false, usesDatePicker: false, requiresLogin: true,  isDigital: true  },
};
