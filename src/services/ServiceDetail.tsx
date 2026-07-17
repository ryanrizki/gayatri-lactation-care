"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getKind, KIND_META } from "./serviceConfig";
import { useEstimate } from "./useEstimate";
import { useServices } from "./ServicesContext";
import { formatIDR } from "@/lib/format";
import type { ServicePackage } from "@/types";
import { ArrowLeft, ArrowRight, ClipboardCheck, Sparkles, MapPin, CheckCircle, ShieldCheck, PlayCircle, Lock, Video, FileText } from "lucide-react";

export default function ServiceDetail({ pkg }: { pkg: ServicePackage }) {
  const router = useRouter();
  const { setIsHomecare, distanceKm, setDistanceKm } = useServices();
  const [showPreviewNote, setShowPreviewNote] = useState(false);

  const kind = getKind(pkg);
  const meta = KIND_META[kind];
  const { estimate } = useEstimate(pkg.id, kind === "homecare", distanceKm);

  const materials = pkg.materials ?? [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <button
        onClick={() => router.push("/layanan")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#836E7A] hover:text-[#3E2A38] transition cursor-pointer select-none"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Layanan
      </button>

      <div className="bg-white rounded-[28px] border border-[#F3D6E2] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-sm">
        {/* Left: package info */}
        <div className="lg:col-span-7 p-5 sm:p-6 md:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-[#F3D6E2]/50">
          <img src={pkg.image} alt={pkg.name} className="w-full h-56 sm:h-64 object-cover rounded-2xl" />
          <div className="space-y-2">
            <span className="inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full border bg-[#FDEAF2] text-[#D85C99] border-[#F8C9DD]">
              {meta.methodLabel}
            </span>
            <h2 className="text-xl md:text-2xl font-display font-black text-[#3E2A38]">{pkg.name}</h2>
            <p className="text-base text-[#5E4455] leading-relaxed">{pkg.description}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#3E2A38]">
              {meta.isDigital ? "Yang Mama Dapatkan" : "Fasilitas & Keuntungan Untuk Mama"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pkg.features.map((feat, idx) => (
                <div key={idx} className="p-3.5 bg-[#FEF7FB] border border-[#F3D6E2]/50 rounded-2xl flex items-start gap-2.5">
                  <CheckCircle className="w-5 h-5 text-[#7BA86F] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#3E2A38] leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex gap-3 text-emerald-800">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sm block">Jaminan Standardisasi Gayatri</span>
              <p className="text-sm leading-relaxed text-emerald-700">
                Bidan dan Dokter Konselor laktasi kami bersertifikat resmi, ramah bayi, dan mengedepankan pendekatan medis yang minim trauma bagi Mama dan buah hati.
              </p>
            </div>
          </div>
        </div>

        {/* Right: category-tailored panel */}
        <div className="lg:col-span-5 p-5 sm:p-6 md:p-8 space-y-6 bg-[#FEF7FB]/50 flex flex-col justify-between">
          <div className="space-y-6">
            {meta.isDigital ? (
              /* ===== KELAS DIGITAL: mock video + locked materials ===== */
              <div className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#3E2A38] flex items-center gap-2">
                    <Video className="w-5 h-5 text-[#D85C99]" /> Isi Kelas Digital
                  </h3>
                  <p className="text-sm text-[#5E4455] leading-relaxed">
                    Materi &amp; video bisa Mama akses kapan saja setelah pembelian.
                  </p>
                </div>

                {/* Mock video preview */}
                <button
                  type="button"
                  onClick={() => setShowPreviewNote((s) => !s)}
                  className="relative block w-full rounded-2xl overflow-hidden border border-[#F3D6E2] group cursor-pointer"
                  aria-label="Putar cuplikan"
                >
                  <img src={pkg.image} alt="Cuplikan kelas" className="w-full h-40 object-cover" />
                  <span className="absolute inset-0 bg-[#2A1C26]/35 flex items-center justify-center">
                    <PlayCircle className="w-14 h-14 text-white/95 group-hover:scale-110 transition-transform" />
                  </span>
                  <span className="absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full bg-white/90 text-[#D85C99] border border-[#F8C9DD]">
                    Cuplikan Gratis
                  </span>
                </button>
                {showPreviewNote && (
                  <p className="text-sm text-[#9C8593] -mt-2">Cuplikan contoh — video penuh terbuka setelah pembelian ya, Ma.</p>
                )}

                {/* Materials list */}
                <ul className="space-y-2.5">
                  {materials.map((m, idx) => (
                    <li key={idx} className="flex items-center gap-3 p-3 bg-white border border-[#F3D6E2]/70 rounded-2xl">
                      {m.type === "video"
                        ? <Video className="w-5 h-5 text-[#D85C99] shrink-0" />
                        : <FileText className="w-5 h-5 text-[#D85C99] shrink-0" />}
                      <span className="text-sm text-[#3E2A38] flex-1 leading-snug">{m.title}</span>
                      {m.preview
                        ? <span className="text-xs font-bold text-[#7BA86F] bg-[#7BA86F]/12 px-2 py-0.5 rounded-full shrink-0">Preview</span>
                        : <Lock className="w-4 h-4 text-[#9C8593] shrink-0" aria-label="Terkunci" />}
                    </li>
                  ))}
                </ul>

                {/* Price box */}
                <div className="bg-[#FDEAF2] border border-[#F8C9DD] p-5 rounded-2xl flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#5E4455]">Harga Kelas</span>
                  <span className="text-xl font-display font-black text-[#D85C99]">{formatIDR(pkg.price)}</span>
                </div>
              </div>
            ) : (
              /* ===== KONSULTASI: config + fee breakdown ===== */
              <>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#3E2A38] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#D85C99]" /> Konfigurasi Layanan
                  </h3>
                  <p className="text-sm text-[#5E4455] leading-relaxed">
                    Sesuaikan pelaksanaan layanan yang paling pas untuk Mama.
                  </p>
                </div>

                <div className="p-5 bg-white border border-[#F3D6E2] rounded-2xl space-y-4 shadow-sm">
                  {kind === "homecare" && (
                    <div className="space-y-3.5">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#3E2A38]">
                        <MapPin className="w-4 h-4 text-[#D85C99]" /> Estimasi Jarak ke Rumah Mama
                      </div>
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-[#5E4455]">Jarak</span>
                        <span className="text-[#D85C99] font-bold bg-[#FDEAF2] px-2.5 py-0.5 rounded-full border border-[#F8C9DD]">{distanceKm} KM</span>
                      </div>
                      <input
                        type="range" min={1} max={35} step={1} value={distanceKm}
                        onChange={(e) => setDistanceKm(parseInt(e.target.value))}
                        className="w-full h-2 bg-[#FCE9F1] accent-[#E97FB1] rounded-full appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-[#9C8593]">
                        <span>&lt;5 km (bebas akomodasi)</span>
                        <span>35 km (tarif tambahan)</span>
                      </div>
                    </div>
                  )}
                  {kind === "klinik" && (
                    <div className="flex items-start gap-2.5 text-sm text-[#3E2A38]">
                      <MapPin className="w-5 h-5 text-[#D85C99] shrink-0 mt-0.5" />
                      <span>Sesi berlangsung tatap muka di Klinik Gayatri, Jakarta Selatan. Tidak ada biaya transport tambahan.</span>
                    </div>
                  )}
                </div>

                <div className="bg-[#FDEAF2] border border-[#F8C9DD] p-5 rounded-2xl space-y-3.5 shadow-sm">
                  <span className="text-sm font-semibold uppercase tracking-wide text-[#D85C99] block border-b border-[#F8B6D2]/40 pb-1">
                    Kalkulator Tarif Transparan
                  </span>
                  <div className="space-y-2 text-sm text-[#3E2A38]">
                    <div className="flex justify-between">
                      <span className="text-[#5E4455]">Tarif dasar layanan</span>
                      <span className="font-bold">{formatIDR(estimate?.basePrice ?? pkg.price)}</span>
                    </div>
                    {kind === "homecare" && (
                      <div className="flex justify-between">
                        <span className="text-[#5E4455]">Transport &amp; akomodasi</span>
                        <span className="font-bold">{formatIDR(estimate?.transportFee ?? 0)}</span>
                      </div>
                    )}
                    <hr className="border-[#F8B6D2]/40 border-dashed" />
                    <div className="flex justify-between text-base font-black pt-1">
                      <span>Total rencana bayar</span>
                      <span className="text-[#D85C99]">{formatIDR(estimate?.total ?? pkg.price)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="pt-6 space-y-3">
            <button
              type="button"
              onClick={() => { setIsHomecare(kind === "homecare"); router.push(`/layanan/${pkg.id}/booking`); }}
              className="w-full bg-[#3E2A38] hover:bg-[#E97FB1] text-white min-h-[48px] py-3.5 rounded-full font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ClipboardCheck className="w-5 h-5" />
              {meta.isDigital ? "Beli Kelas" : "Lanjut ke Reservasi"}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => router.push("/layanan")}
              className="w-full text-center min-h-[44px] py-2 text-sm text-[#9C8593] hover:text-[#3E2A38] transition font-bold"
            >
              Lihat Layanan Lain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
