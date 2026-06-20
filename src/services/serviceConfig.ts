import { SERVICE_PACKAGES } from "../data/challengesData";
import { ServicePackage } from "../types";

export type ServiceKind = "homecare" | "klinik" | "class" | "webinar";

/** Resolve a package to its tailored flow kind. */
export function getKind(pkg: ServicePackage): ServiceKind {
  if (pkg.id === "laktasi_homecare") return "homecare";
  if (pkg.id === "laktasi_klinik") return "klinik";
  if (pkg.category === "webinar") return "webinar";
  return "class";
}

export function findPackage(id: string | undefined): ServicePackage | undefined {
  return SERVICE_PACKAGES.find((p) => p.id === id);
}

/** Hardcoded upcoming webinar session (no events backend). Edit freely. */
export const WEBINAR_EVENT = {
  dateLabel: "11 Juli 2026",
  timeLabel: "10:00 WIB",
};

export interface KindMeta {
  methodLabel: string;   // human label for the delivery method
  usesDistance: boolean; // show distance slider + transport fee
  usesDatePicker: boolean; // booking shows date + time pickers
  usesEmail: boolean;    // booking collects email (Zoom link)
}

export const KIND_META: Record<ServiceKind, KindMeta> = {
  homecare: { methodLabel: "Kunjungan Rumah (Homecare)", usesDistance: true,  usesDatePicker: true,  usesEmail: false },
  klinik:   { methodLabel: "Tatap Muka di Klinik",       usesDistance: false, usesDatePicker: true,  usesEmail: false },
  class:    { methodLabel: "Kelas Privat",               usesDistance: false, usesDatePicker: true,  usesEmail: false },
  webinar:  { methodLabel: "Webinar Online (Zoom)",      usesDistance: false, usesDatePicker: false, usesEmail: true  },
};
