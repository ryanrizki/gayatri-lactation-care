"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getKind, KIND_META } from "./serviceConfig";
import { useEstimate } from "./useEstimate";
import { useServices } from "./ServicesContext";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatIDR } from "@/lib/format";
import type { ServicePackage } from "@/types";
import { ArrowLeft, ClipboardCheck, User, AlertCircle, Info, Download } from "lucide-react";

const inputClass = "w-full min-h-[44px] px-4 py-2.5 text-base border border-[#F3D6E2] focus:border-[#E97FB1] rounded-2xl focus:outline-none bg-[#FFFCFD] text-[#3E2A38]";
const labelClass = "text-sm font-bold text-[#5E4455] block mb-1.5";

export default function ServiceBooking({ pkg }: { pkg: ServicePackage }) {
  const router = useRouter();
  const { distanceKm, draft, setDraft, receipt, setReceipt } = useServices();
  const { data: session } = useSession();
  const user = session?.user;
  const [warning, setWarning] = useState<string | null>(null);

  const kind = getKind(pkg);
  const meta = KIND_META[kind];
  const { estimate } = useEstimate(pkg.id, kind === "homecare", distanceKm);

  useEffect(() => {
    if (receipt && receipt.serviceName !== pkg.name) setReceipt(null);
  }, [pkg, receipt, setReceipt]);

  const total = estimate?.total ?? pkg.price;
  const isDigital = meta.isDigital;

  // Consultation form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name || !draft.phone || (meta.usesDatePicker && !draft.date)) {
      setWarning("Mohon lengkapi data yang ditandai wajib ya, Ma. 🌸");
      return;
    }
    setWarning(null);
    setReceipt({
      id: "BK-" + Math.floor(100000 + ((pkg.price + draft.name.length * 37) % 900000)),
      name: draft.name,
      phone: draft.phone,
      serviceName: pkg.name,
      kind,
      dateLabel: draft.date,
      time: draft.time,
      methodLabel: kind === "homecare" ? `${meta.methodLabel} (${distanceKm} km)` : meta.methodLabel,
      distanceKm: kind === "homecare" ? distanceKm : undefined,
      total,
    });
  };

  // Kelas purchase confirm (requires login)
  const handleBuy = () => {
    if (!user) return;
    setReceipt({
      id: "KLS-" + Math.floor(100000 + ((pkg.price + (user.name ?? "").length * 37) % 900000)),
      name: user.name ?? "",
      phone: user.email ?? "",
      serviceName: pkg.name,
      kind,
      dateLabel: "Akses digital",
      time: "",
      methodLabel: "Kelas Digital",
      total,
    });
  };

  const resetAll = () => {
    setReceipt(null);
    setDraft({ name: "", phone: "", email: "", date: "", time: "09:00" });
    router.push("/layanan");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <button
        onClick={() => router.push(`/layanan/${pkg.id}`)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#836E7A] hover:text-[#3E2A38] transition cursor-pointer select-none"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Detail Layanan
      </button>

      <div className="max-w-4xl mx-auto bg-white rounded-[28px] border border-[#F3D6E2] overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-sm">
        {/* Summary */}
        <div className="md:col-span-5 p-5 sm:p-6 bg-[#FEF7FB] border-b md:border-b-0 md:border-r border-[#F3D6E2]/50 flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <span className="text-sm font-bold text-[#D85C99] uppercase tracking-wide block">Langkah Akhir</span>
              <h3 className="text-lg font-display font-bold text-[#3E2A38]">Ringkasan Pilihan</h3>
            </div>
            <div className="p-4 bg-white border border-[#F3D6E2]/50 rounded-2xl space-y-4">
              <div>
                <span className="text-xs font-bold text-[#9C8593] block uppercase tracking-wide">Program</span>
                <span className="text-base font-bold text-[#3E2A38] block leading-snug mt-0.5">{pkg.name}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#9C8593] block uppercase tracking-wide">Metode</span>
                <span className="text-base font-bold text-[#3E2A38] block mt-0.5">
                  {kind === "homecare" ? `${meta.methodLabel} (${distanceKm} km)` : meta.methodLabel}
                </span>
              </div>
              <hr className="border-[#F3D6E2]/50 border-dashed" />
              <div className="flex justify-between items-center text-base font-bold">
                <span className="text-[#5E4455]">Total</span>
                <span className="text-[#D85C99] bg-[#FDEAF2] px-2.5 py-1 rounded-full">{formatIDR(total)}</span>
              </div>
            </div>
            <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-2xl flex items-start gap-2 text-sm text-sky-800 leading-snug">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>{isDigital
                ? "Setelah pembelian, materi & video tersimpan di akun Mama. Tim kami mengaktifkannya segera."
                : "Pembayaran dilakukan langsung setelah layanan selesai. 100% transparan tanpa deposit di awal."}</span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-7 p-5 sm:p-6 md:p-8">
          {receipt ? (
            <div className="space-y-6 text-center animate-fadeIn py-2">
              <div className="w-16 h-16 bg-[#D1E1CE] text-[#4D6B4E] border border-[#CCDDC8] flex items-center justify-center rounded-full mx-auto text-2xl font-black">✓</div>
              <div className="space-y-1">
                <h3 className="text-lg font-display font-bold text-[#3E2A38]">{isDigital ? "Pembelian Berhasil!" : "Pendaftaran Berhasil!"}</h3>
                <p className="text-sm text-[#5E4455]">Kode: <span className="font-bold text-[#3E2A38]">{receipt.id}</span></p>
              </div>
              <div className="bg-[#FEF7FB] border border-[#F3D6E2]/55 text-left p-5 rounded-2xl text-sm text-[#5E4455] leading-relaxed space-y-3">
                <p><span className="text-[#9C8593] font-bold block uppercase text-xs tracking-wide">{isDigital ? "Pembeli" : "Pendaftar"}</span><span className="font-bold text-[#3E2A38]">{receipt.name}</span> ({receipt.phone})</p>
                <p><span className="text-[#9C8593] font-bold block uppercase text-xs tracking-wide">{isDigital ? "Kelas" : "Layanan"}</span><span className="font-bold text-[#3E2A38]">{receipt.serviceName}</span></p>
                {!isDigital && (
                  <>
                    <p><span className="text-[#9C8593] font-bold block uppercase text-xs tracking-wide">Jadwal</span><span className="font-bold text-[#3E2A38]">{receipt.dateLabel} · {receipt.time} WIB</span></p>
                    <p><span className="text-[#9C8593] font-bold block uppercase text-xs tracking-wide">Metode</span><span className="font-bold text-[#3E2A38]">{receipt.methodLabel}</span></p>
                  </>
                )}
                <div className="border-t border-dashed border-[#F3D6E2] pt-2.5 flex justify-between font-bold text-base text-[#3E2A38]">
                  <span>Total</span><span className="text-[#D85C99] font-black">{formatIDR(receipt.total)}</span>
                </div>
              </div>
              <p className="text-sm text-[#9C8593] leading-relaxed max-w-md mx-auto">
                {isDigital
                  ? "Materi & video akan tersedia di halaman akun Gayatri Mama. Tim kami akan mengaktifkannya segera ya, Ma!"
                  : "Admin Gayatri menghubungi Mama via WhatsApp maksimal 1×24 jam untuk konfirmasi. Terima kasih ya, Ma!"}
              </p>
              <button type="button" onClick={resetAll} className="w-full min-h-[48px] py-3 bg-[#3E2A38] hover:bg-[#E97FB1] text-white font-bold text-sm rounded-full cursor-pointer transition-colors shadow-md">
                Kembali ke Daftar Layanan
              </button>
            </div>
          ) : isDigital ? (
            /* ===== KELAS: login gate -> confirm purchase ===== */
            !user ? (
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-bold text-[#D85C99] bg-[#FDEAF2] px-3.5 py-1 rounded-full inline-block uppercase tracking-wide">Masuk untuk membeli kelas</span>
                  <h3 className="text-lg font-display font-bold text-[#3E2A38] mt-1.5">Masuk dulu ya, Ma 🌸</h3>
                </div>
                <p className="text-sm text-[#5E4455] leading-relaxed">Masuk dulu untuk membeli kelas ya, Ma. Materi &amp; video tersimpan di akun Mama.</p>
                <Link href={`/masuk?callbackUrl=/layanan/${pkg.id}/booking`} className="w-full bg-[#3E2A38] hover:bg-[#E97FB1] text-white min-h-[48px] py-3.5 rounded-full font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md">
                  Masuk ke Akun Mama
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-bold text-[#D85C99] bg-[#FDEAF2] px-3.5 py-1 rounded-full inline-block uppercase tracking-wide">Konfirmasi Pembelian</span>
                  <h3 className="text-lg font-display font-bold text-[#3E2A38] mt-1.5">Halo, {user.name?.split(" ")[0]} 🌸</h3>
                </div>
                <div className="p-4 bg-[#FEF7FB] border border-[#F3D6E2]/55 rounded-2xl space-y-2 text-sm text-[#5E4455]">
                  <p>Mama akan membeli <b className="text-[#3E2A38]">{pkg.name}</b> seharga <b className="text-[#D85C99]">{formatIDR(total)}</b>.</p>
                  <p className="flex items-start gap-2"><Download className="w-4 h-4 text-[#D85C99] shrink-0 mt-0.5" /> Materi &amp; video terbuka di akun Mama setelah pembelian.</p>
                </div>
                <button type="button" onClick={handleBuy} className="w-full bg-[#3E2A38] hover:bg-[#E97FB1] text-white min-h-[48px] py-3.5 rounded-full font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md">
                  <ClipboardCheck className="w-5 h-5" /> Konfirmasi Pembelian
                </button>
                <button type="button" onClick={() => router.push(`/layanan/${pkg.id}`)} className="w-full text-center min-h-[44px] py-2 text-sm text-[#9C8593] hover:text-[#3E2A38] transition font-bold">
                  Batal &amp; Kembali ke Detail
                </button>
              </div>
            )
          ) : (
            /* ===== KONSULTASI: contact form ===== */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <span className="text-xs font-bold text-[#D85C99] bg-[#FDEAF2] px-3.5 py-1 rounded-full inline-block uppercase tracking-wide">Formulir Reservasi</span>
                <h3 className="text-lg font-display font-bold text-[#3E2A38] mt-1.5">Data Kontak Mama</h3>
              </div>

              {warning && (
                <div className="p-3.5 bg-[#FFFBFA] border border-[#FFD9D4] rounded-2xl text-sm text-red-700 flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> <span>{warning}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-[#5E4455] block mb-1.5">Nama Lengkap Mama</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C8593]/70" />
                    <input type="text" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Contoh: Rania Kirana" className={inputClass + " pl-10"} required />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Nomor WhatsApp Aktif</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-[#3E2A38]/60 font-black">+62</span>
                    <input type="tel" value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} placeholder="812345678" className={inputClass + " pl-14"} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Tanggal</label>
                    <input type="date" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} className={inputClass + " cursor-pointer"} required />
                  </div>
                  <div>
                    <label className={labelClass}>Waktu / Sesi</label>
                    <select value={draft.time} onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))} className={inputClass + " cursor-pointer"}>
                      <option value="09:00">09:00 WIB</option>
                      <option value="11:00">11:00 WIB</option>
                      <option value="13:00">13:00 WIB</option>
                      <option value="15:00">15:00 WIB</option>
                      <option value="18:30">18:30 WIB</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button type="submit" className="w-full bg-[#3E2A38] hover:bg-[#E97FB1] text-white min-h-[48px] py-3.5 rounded-full font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md">
                  <ClipboardCheck className="w-5 h-5" /> Konfirmasi Reservasi
                </button>
                <button type="button" onClick={() => router.push(`/layanan/${pkg.id}`)} className="w-full text-center min-h-[44px] py-2 text-sm text-[#9C8593] hover:text-[#3E2A38] transition font-bold">
                  Batal &amp; Kembali ke Detail
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
