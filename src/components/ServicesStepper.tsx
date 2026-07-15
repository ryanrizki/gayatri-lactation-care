"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function ServicesStepper() {
  const pathname = usePathname();
  const router = useRouter();

  // Derive current step + selected id from the URL.
  const rest = pathname.replace(/^\/layanan\/?/, ""); // "" | ":id" | ":id/booking"
  const segments = rest.split("/").filter(Boolean);
  const selectedId = segments[0];
  const step: 1 | 2 | 3 = segments.includes("booking") ? 3 : selectedId ? 2 : 1;

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
            onClick={() => it.enabled && router.push(it.to)}
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
}
