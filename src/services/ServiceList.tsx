"use client";

import { useRouter } from "next/navigation";
import { SERVICE_PACKAGES } from "../data/challengesData";
import { CheckCircle, ArrowRight } from "lucide-react";
import { formatIDR } from "@/lib/format";

export default function ServiceList() {
  const router = useRouter();
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between gap-3 border-b border-[#F3D6E2]/50 pb-3">
        <h2 className="text-base sm:text-lg font-display font-bold text-[#3E2A38]">
          Pilih Layanan Terbaik Untuk Mama
        </h2>
        <span className="text-sm font-semibold text-[#836E7A] shrink-0">
          {SERVICE_PACKAGES.length} Program
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {SERVICE_PACKAGES.map((pkg) => {
          const catLabel = pkg.category === "consultation" ? "Konsultasi" : "Kelas";
          const catClass = pkg.category === "consultation"
            ? "bg-white/90 text-[#836E7A] border-[#F3D6E2]"
            : "bg-[#FDEAF2] text-[#D85C99] border-[#F8C9DD]";
          return (
            <div
              key={pkg.id}
              className="border border-[#F3D6E2] p-3 sm:p-5 flex flex-col justify-between transition-all duration-300 rounded-3xl bg-white hover:-translate-y-0.5 hover:border-[#F8B6D2] hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="relative">
                  <img src={pkg.image} alt={pkg.name} loading="lazy" className="w-full h-28 sm:h-36 object-cover rounded-2xl" />
                  <span className={`absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur ${catClass}`}>
                    {catLabel}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-display font-bold text-[#3E2A38] leading-snug line-clamp-2">{pkg.name}</h3>
                  <p className="text-lg font-display font-black text-[#D85C99]">{formatIDR(pkg.price)}</p>
                  <p className="text-sm text-[#5E4455] leading-relaxed line-clamp-2">{pkg.description}</p>
                </div>
                <ul className="space-y-1.5 text-sm text-[#5E4455]">
                  {pkg.features.slice(0, 2).map((feat, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <CheckCircle className="w-4 h-4 text-[#7BA86F] shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{feat}</span>
                    </li>
                  ))}
                  {pkg.features.length > 2 && (
                    <li className="text-sm text-[#9C8593] italic pl-6">+{pkg.features.length - 2} manfaat lainnya</li>
                  )}
                </ul>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => router.push(`/layanan/${pkg.id}`)}
                  className="w-full min-h-[44px] py-3 bg-[#3E2A38] hover:bg-[#E97FB1] text-white rounded-full text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Lihat Detail</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
