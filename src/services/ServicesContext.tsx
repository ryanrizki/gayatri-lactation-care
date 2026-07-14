"use client";

import React, { createContext, useContext, useState } from "react";

export interface BookingDraft {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
}

export interface Receipt {
  id: string;
  name: string;
  phone: string;
  email?: string;
  serviceName: string;
  kind: string;
  dateLabel: string;   // date picked, or "Akses digital" for kelas
  time: string;
  methodLabel: string;
  distanceKm?: number;
  total: number;
}

export interface ServicesCtx {
  isHomecare: boolean;
  setIsHomecare: (v: boolean) => void;
  distanceKm: number;
  setDistanceKm: (v: number) => void;
  draft: BookingDraft;
  setDraft: React.Dispatch<React.SetStateAction<BookingDraft>>;
  receipt: Receipt | null;
  setReceipt: (r: Receipt | null) => void;
}

const EMPTY_DRAFT: BookingDraft = { name: "", phone: "", email: "", date: "", time: "09:00" };

const Ctx = createContext<ServicesCtx | null>(null);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const [isHomecare, setIsHomecare] = useState(true);
  const [distanceKm, setDistanceKm] = useState(4);
  const [draft, setDraft] = useState<BookingDraft>(EMPTY_DRAFT);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const value: ServicesCtx = {
    isHomecare, setIsHomecare,
    distanceKm, setDistanceKm,
    draft, setDraft,
    receipt, setReceipt,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useServices(): ServicesCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useServices harus dipakai di dalam ServicesProvider");
  return ctx;
}
