import React, { useState } from "react";
import { Outlet, useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

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

export function useServices() {
  return useOutletContext<ServicesCtx>();
}

const EMPTY_DRAFT: BookingDraft = { name: "", phone: "", email: "", date: "", time: "09:00" };

export default function ServicesLayout() {
  const [isHomecare, setIsHomecare] = useState(true);
  const [distanceKm, setDistanceKm] = useState(4);
  const [draft, setDraft] = useState<BookingDraft>(EMPTY_DRAFT);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const ctx: ServicesCtx = {
    isHomecare, setIsHomecare, distanceKm, setDistanceKm,
    draft, setDraft, receipt, setReceipt,
  };

  const { pathname } = useLocation();
  const navigate = useNavigate();
  // Derive current step + selected id from the URL.
  const rest = pathname.replace(/^\/layanan\/?/, ""); // "" | ":id" | ":id/booking"
  const segments = rest.split("/").filter(Boolean);
  const selectedId = segments[0];
  const step: 1 | 2 | 3 = segments.includes("booking") ? 3 : selectedId ? 2 : 1;

  const Stepper = () => {
    const items = [
      { n: 1, label: "Pilih", short: "Pilih", to: "/layanan", enabled: true },
      { n: 2, label: "Detail", short: "Detail", to: selectedId ? `/layanan/${selectedId}` : "", enabled: !!selectedId },
      { n: 3, label: "Pesan", short: "Pesan", to: selectedId ? `/layanan/${selectedId}/booking` : "", enabled: !!selectedId },
    ];
    return (
      <div className="flex justify-center items-center gap-1 sm:gap-2 max-w-xl mx-auto py-2 px-2 sm:py-3 sm:px-4 bg-white/60 backdrop-blur rounded-2xl border border-[#F3D6E2]/60 text-sm font-bold text-[#836E7A] shadow-sm">
        {items.map((it, i) => (
          <React.Fragment key={it.n}>
            {i > 0 && <ChevronRight className="w-4 h-4 text-[#F3D6E2] shrink-0" />}
            <button
              type="button"
              disabled={!it.enabled}
              onClick={() => it.enabled && navigate(it.to)}
              className={`flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl transition cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${
                step === it.n ? "bg-[#3E2A38] text-white shadow-md font-bold" : "hover:bg-[#F3D6E2]/30 text-[#5E4455]"
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === it.n ? "bg-[#F8B6D2] text-[#2A1C26]" : "bg-[#F3D6E2]/55 text-[#3E2A38]"
              }`}>{it.n}</span>
              <span className="hidden sm:inline">{it.label}</span>
              <span className="sm:hidden">{it.short}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 mb-16">
      <div className="text-center max-w-3xl mx-auto space-y-4 pb-2">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#D85C99] bg-[#FDEAF2] px-5 py-2 rounded-full shadow-sm">
          🌸 Layanan Spesialis Laktasi Gayatri
        </span>
        <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-[#3E2A38]">
          Pendampingan Laktasi <span className="text-[#E97FB1]">Terpadu</span>
        </h1>
        <p className="text-[#5E4455] text-base leading-relaxed max-w-lg mx-auto">
          Mendampingi setiap momen menyusui dengan pendekatan medis yang suportif, minim trauma, dan terstandarisasi untuk Mama dan si Kecil.
        </p>
      </div>

      <Stepper />

      <Outlet context={ctx} />
    </div>
  );
}
