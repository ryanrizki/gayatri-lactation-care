/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { SERVICE_PACKAGES } from "../data/challengesData";
import { ServicePackage } from "../types";
import { 
  MapPin, 
  Calendar, 
  User, 
  PhoneCall, 
  CheckCircle, 
  DollarSign, 
  Sparkles, 
  Info,
  ChevronRight,
  ClipboardCheck,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock,
  Briefcase,
  BookOpen
} from "lucide-react";

type ViewStep = "list" | "detail" | "booking";

export default function ServicesSection() {
  const [step, setStep] = useState<ViewStep>("list");
  const [selectedPkgId, setSelectedPkgId] = useState<string>("laktasi_homecare");
  const [distanceKm, setDistanceKm] = useState<number>(4);
  const [isHomecare, setIsHomecare] = useState<boolean>(true);
  
  // Estimate response from backend
  const [estimateData, setEstimateData] = useState<{
    serviceName: string;
    basePrice: number;
    transportFee: number;
    total: number;
  } | null>(null);

  // Booking states
  const [mamaName, setMamaName] = useState<string>("");
  const [mamaPhone, setMamaPhone] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<string>("");
  const [bookingTime, setBookingTime] = useState<string>("09:00");
  const [bookedReceipt, setBookedReceipt] = useState<any>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  // Find currently selected package details
  const currentPkg = SERVICE_PACKAGES.find(pkg => pkg.id === selectedPkgId) || SERVICE_PACKAGES[0];

  // Adjust homecare default compatibility based on package category or selections
  useEffect(() => {
    if (currentPkg.id === "laktasi_klinik" || currentPkg.category === "webinar") {
      setIsHomecare(false);
    } else if (currentPkg.id === "laktasi_homecare") {
      setIsHomecare(true);
    }
  }, [selectedPkgId]);

  // Fetch dynamic estimate from backend
  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        const response = await fetch("/api/estimator", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            packageId: selectedPkgId,
            locationDistance: distanceKm,
            isHomecare: isHomecare
          })
        });

        if (response.ok) {
          const data = await response.json();
          setEstimateData(data);
        }
      } catch (err) {
        console.error("Error fetching estimate", err);
      }
    };

    fetchEstimate();
  }, [selectedPkgId, distanceKm, isHomecare]);

  // Handle Form submit
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mamaName || !mamaPhone || !bookingDate) {
      setWarningMsg("Harap lengkapi Nama, Nomor WhatsApp, dan Tanggal Kunjungan untuk menyelesaikan pemesanan ya Ma. :)");
      return;
    }
    setWarningMsg(null);

    // Capture final invoice state
    const receipt = {
      id: "BK-" + Math.floor(100000 + Math.random() * 900000),
      clientName: mamaName,
      phone: mamaPhone,
      date: bookingDate,
      time: bookingTime,
      serviceName: currentPkg.name,
      total: estimateData?.total || currentPkg.price,
      isHomecare,
      distanceKm: isHomecare ? distanceKm : 0
    };

    setBookedReceipt(receipt);
  };

  // Helper currency formatter
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleSelectPackage = (pkgId: string) => {
    setSelectedPkgId(pkgId);
    setStep("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoToBooking = () => {
    setStep("booking");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToDetail = () => {
    setStep("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToList = () => {
    setStep("list");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 mb-16">
      
      {/* Visual Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pb-4">
        <span className="text-[11px] font-sans font-black uppercase tracking-[0.25em] text-[#E06E43] bg-[#FFF2EB] px-6 py-2 rounded-full inline-block shadow-sm">
          🌸 Layanan Spesialis Laktasi Gayatri
        </span>
        <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-[#3F322F]">
          Pendampingan Laktasi <span className="text-[#F2A07C]">Terpadu</span>
        </h1>
        <p className="text-[#7A6A65] text-sm leading-relaxed max-w-lg mx-auto font-sans">
          Mendampingi setiap momen menyusui dengan pendekatan medis yang suportif, minim trauma, dan terstandarisasi untuk Mama dan si Kecil.
        </p>
      </div>

      {/* Progress Multi-step Navigation Stepper */}
      <div className="flex justify-center items-center gap-1 sm:gap-2 max-w-xl mx-auto py-2 px-2 sm:py-3 sm:px-4 bg-white/60 backdrop-blur rounded-2xl border border-[#EADCC9]/60 text-sm font-bold text-[#7A6A65] shadow-sm">
        <button
          onClick={handleBackToList}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition cursor-pointer select-none ${
            step === "list"
              ? "bg-[#3F322F] text-white shadow-md font-bold"
              : "hover:bg-[#EADCC9]/30 text-[#5C453C]"
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            step === "list" ? "bg-[#FBC2A2] text-[#291E1C]" : "bg-[#EADCC9]/55 text-[#3F322F]"
          }`}>1</span>
          <span className="hidden sm:inline">Pilih Layanan</span>
          <span className="sm:hidden">Layanan</span>
        </button>

        <ChevronRight className="w-4 h-4 text-[#EADCC9] shrink-0" />

        <button
          onClick={() => {
            if (selectedPkgId) {
              setStep("detail");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          disabled={!selectedPkgId}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition cursor-pointer select-none ${
            step === "detail"
              ? "bg-[#3F322F] text-white shadow-md font-bold"
              : "hover:bg-[#EADCC9]/30 text-[#5C453C]"
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            step === "detail" ? "bg-[#FBC2A2] text-[#291E1C]" : "bg-[#EADCC9]/55 text-[#3F322F]"
          }`}>2</span>
          <span className="hidden sm:inline">Konfigurasi</span>
          <span className="sm:hidden">Setup</span>
        </button>

        <ChevronRight className="w-4 h-4 text-[#EADCC9] shrink-0" />

        <button
          onClick={() => {
            if (selectedPkgId) {
              setStep("booking");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          disabled={!selectedPkgId}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition cursor-pointer select-none ${
            step === "booking"
              ? "bg-[#3F322F] text-white shadow-md font-bold"
              : "hover:bg-[#EADCC9]/30 text-[#5C453C]"
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            step === "booking" ? "bg-[#FBC2A2] text-[#291E1C]" : "bg-[#EADCC9]/55 text-[#3F322F]"
          }`}>3</span>
          <span className="hidden sm:inline">Reservasi</span>
          <span className="sm:hidden">Booking</span>
        </button>
      </div>

      {/* STEP 1: LIST OF CLASSES & CLINIC PROGRAMS */}
      {step === "list" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between gap-3 border-b border-[#EADCC9]/50 pb-3">
            <h2 className="text-base sm:text-lg font-display font-bold text-[#3F322F]">
              Pilih Layanan Terbaik Untuk Mama
            </h2>
            <span className="text-sm font-semibold text-[#7A6A65] shrink-0">
              {SERVICE_PACKAGES.length} Program
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {SERVICE_PACKAGES.map((pkg) => {
              const isSelected = selectedPkgId === pkg.id;
              const catLabel = pkg.category === "consultation" ? "Konsultasi" : pkg.category === "class" ? "Kelas Privat" : "Webinar";
              const catClass = pkg.category === "consultation"
                ? "bg-white/90 text-[#7A6A65] border-[#EADCC9]"
                : pkg.category === "class"
                ? "bg-[#FFF2EB] text-[#E06E43] border-[#FFD3BE]"
                : "bg-blue-50 text-blue-700 border-blue-100";
              return (
                <div
                  key={pkg.id}
                  className={`border p-3 sm:p-5 flex flex-col justify-between transition-all duration-300 rounded-3xl bg-white hover:-translate-y-0.5 ${
                    isSelected
                      ? "border-[#F2A07C] shadow-md ring-2 ring-[#F2A07C]/20"
                      : "border-[#EADCC9] hover:border-[#FBC2A2] hover:shadow-md"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Image with category badge overlay */}
                    <div className="relative">
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        loading="lazy"
                        className="w-full h-28 sm:h-36 object-cover rounded-2xl"
                      />
                      <span className={`absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur ${catClass}`}>
                        {catLabel}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-display font-bold text-[#3F322F] leading-snug line-clamp-2">
                        {pkg.name}
                      </h3>
                      <p className="text-lg font-display font-black text-[#E06E43]">
                        {formatIDR(pkg.price)}
                      </p>
                      <p className="text-sm text-[#5C453C] leading-relaxed line-clamp-2">
                        {pkg.description}
                      </p>
                    </div>

                    {/* Top benefits */}
                    <ul className="space-y-1.5 text-sm text-[#5C453C]">
                      {pkg.features.slice(0, 2).map((feat, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <CheckCircle className="w-4 h-4 text-[#7BA86F] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feat}</span>
                        </li>
                      ))}
                      {pkg.features.length > 2 && (
                        <li className="text-sm text-[#937F73] italic pl-6">
                          +{pkg.features.length - 2} manfaat lainnya
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => handleSelectPackage(pkg.id)}
                      className="w-full min-h-[44px] py-3 bg-[#3F322F] hover:bg-[#F2A07C] text-white rounded-full text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
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
      )}

      {/* STEP 2: DETAILS & DYNAMIC PRICING CONFIGURATION */}
      {step === "detail" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Back top control */}
          <button
            onClick={handleBackToList}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#937F73] hover:text-[#3F322F] transition cursor-pointer select-none"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Layanan
          </button>

          <div className="bg-white rounded-[28px] border border-[#EADCC9]/65 overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-sm">
            
            {/* Left Column: Product Info & Core Checklist */}
            <div className="lg:col-span-7 p-5 sm:p-6 md:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-[#EADCC9]/50">
              <img
                src={currentPkg.image}
                alt={currentPkg.name}
                className="w-full h-64 object-cover rounded-2xl"
              />
              <div className="space-y-2">
                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border inline-block ${
                  currentPkg.category === "consultation" 
                    ? "bg-[#FAF6F0] text-[#7A6A65] border-[#EADCC9]/60" 
                    : currentPkg.category === "class" 
                    ? "bg-[#FFF2EB] text-[#E06E43] border-[#FFD3BE]"
                    : "bg-blue-50 text-blue-700 border-blue-100"
                }`}>
                  {currentPkg.category === "consultation" ? "Konsultasi Klinis Medis" : currentPkg.category === "class" ? "Kelas Bimbingan Laktasi Privat" : "Webinar Kelompok Edukasi"}
                </span>

                <h2 className="text-xl md:text-2xl font-display font-black text-[#3F322F]">
                  {currentPkg.name}
                </h2>
              </div>

              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EADCC9]/40 space-y-3">
                <h4 className="text-[10px] font-bold uppercase text-[#937F73] tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#E06E43]" /> Deskripsi Program
                </h4>
                <p className="text-xs text-[#5C453C] leading-relaxed">
                  {currentPkg.description}
                </p>
              </div>

              {/* Package detailed benefits */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3F322F]">
                  Fasilitas & Keuntungan Yang Didapatkan Mama:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {currentPkg.features.map((feat, idx) => (
                    <div key={idx} className="p-3 bg-white border border-[#EADCC9]/40 rounded-xl flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-[#F2A07C] shrink-0 mt-0.5" />
                      <span className="text-xs text-[#3F322F] leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secure guarantee card */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex gap-3 text-emerald-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-xs">Jaminan Standardisasi Gayatri</span>
                  <p className="text-[11px] leading-relaxed text-emerald-700">
                    Bidan atau Dokter Konselor laktasi kami bersertifikat resmi, ramah bayi, serta senantiasa mengedepankan pendekatan laktasi medis yang minim trauma bagi Mama dan buah hati.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Estimate & Method Config */}
            <div className="lg:col-span-5 p-5 sm:p-6 md:p-8 space-y-6 bg-[#FAF8F5]/40 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#3F322F] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#E06E43]" /> Konfigurasi Metode Kunjungan
                  </h3>
                  <p className="text-[11px] text-[#7A6A65] leading-relaxed">
                    Tentukan metode pelaksanaan yang dirasa paling praktis bagi Mama hari ini.
                  </p>
                </div>

                <div className="p-5 bg-white border border-[#EADCC9]/55 rounded-2xl space-y-4 shadow-sm">
                  {/* Select execution method */}
                  {currentPkg.id !== "laktasi_klinik" && currentPkg.id !== "laktasi_homecare" && currentPkg.category !== "webinar" ? (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-[#937F73] block uppercase tracking-wider">Metode Pelaksanaan</span>
                      <div className="flex bg-[#FAF1E6] p-1.5 rounded-full border border-[#EADCC9]/30">
                        <button
                          type="button"
                          onClick={() => setIsHomecare(true)}
                          className={`flex-1 text-center py-2 text-[10px] font-bold rounded-full transition cursor-pointer select-none ${
                            isHomecare ? "bg-[#3F322F] text-white shadow-sm" : "text-[#7A6A65] hover:text-[#3F322F]"
                          }`}
                        >
                          Panggil Ke Rumah (Homecare)
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsHomecare(false)}
                          className={`flex-1 text-center py-2 text-[10px] font-bold rounded-full transition cursor-pointer select-none ${
                            !isHomecare ? "bg-[#3F322F] text-white shadow-sm" : "text-[#7A6A65] hover:text-[#3F322F]"
                          }`}
                        >
                          Datang ke Klinik
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[9px] font-bold text-[#937F73] block uppercase tracking-wider">Metode Pelaksanaan (Tetap)</span>
                      <div className="mt-1.5 py-1.5 px-3.5 bg-[#FAF1E6] rounded-xl text-xs font-bold text-[#3F322F] inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#E06E43]" />
                        {currentPkg.id === "laktasi_homecare" 
                          ? "Kunjungan Rumah (Homecare)" 
                          : currentPkg.category === "webinar" 
                          ? "Akses Webinar Online (Zoom)" 
                          : "Tatap Muka di Klinik Utama"}
                      </div>
                    </div>
                  )}

                  {/* Distance slider option if Homecare is activated */}
                  {isHomecare && currentPkg.category !== "webinar" && (
                    <div className="space-y-3.5 pt-1 border-t border-[#FAF6F0] mt-3">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-[#3F322F]">Estimasi Jarak Rumah ke Klinik:</span>
                        <span className="text-[#E06E43] font-bold bg-[#FFF2EB] px-2.5 py-0.5 rounded-full border border-[#FFD3BE]">{distanceKm} KM</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="35"
                        step="1"
                        value={distanceKm}
                        onChange={(e) => setDistanceKm(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[#FAF1E6] accent-[#F2A07C] rounded-full appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[#937F73]">
                        <span>&lt;5 km (Bebas Akomodasi)</span>
                        <span>35 km (Tarif Tambahan)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Estimate calculation breakdown box */}
                {estimateData ? (
                  <div className="bg-[#FFF2EB] border border-[#FFD3BE] p-5 rounded-2xl space-y-3.5 shadow-sm">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#E06E43] block border-b border-[#FBC2A2]/30 pb-1">
                      Kalkulator Tarif Transparan
                    </span>
                    
                    <div className="space-y-2 text-xs text-[#3F322F]">
                      <div className="flex justify-between">
                        <span className="text-[#7A6A65]">Biaya Tarif Dasar Layanan</span>
                        <span className="font-bold">{formatIDR(estimateData.basePrice)}</span>
                      </div>

                      {isHomecare && currentPkg.category !== "webinar" && (
                        <div className="flex justify-between">
                          <span className="text-[#7A6A65]">Biaya Transport & Akomodasi</span>
                          <span className="font-bold">{formatIDR(estimateData.transportFee)}</span>
                        </div>
                      )}

                      <hr className="border-[#FBC2A2]/30 border-dashed" />

                      <div className="flex justify-between text-sm font-black pt-1">
                        <span>Total Rencana Pembayaran</span>
                        <span className="text-[#E06E43]">{formatIDR(estimateData.total)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-28 bg-[#FAF1E6] rounded-2xl animate-pulse" />
                )}
              </div>

              <div className="pt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleGoToBooking}
                  className="w-full bg-[#3F322F] hover:bg-[#F2A07C] text-white py-3.5 rounded-full font-bold text-xs transition duration-250 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#3F322F]/15"
                >
                  <ClipboardCheck className="w-4 h-4" /> Lanjutkan ke Formulir Reservasi
                </button>
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="w-full text-center py-2 text-[11px] text-[#937F73] hover:text-[#3F322F] transition font-bold"
                >
                  Model Program Lainnya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: BOOKING FORM / RESERVATION RECEIPT */}
      {step === "booking" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Back detail control */}
          <button
            onClick={handleBackToDetail}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#937F73] hover:text-[#3F322F] transition cursor-pointer select-none"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Konfigurasi Detail Laktasi
          </button>

          <div className="max-w-4xl mx-auto bg-white rounded-[28px] border border-[#EADCC9]/65 overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-sm">
            
            {/* Left: Selected Receipt Summary */}
            <div className="md:col-span-5 p-5 sm:p-6 bg-[#FAF8F5] border-b md:border-b-0 md:border-r border-[#EADCC9]/50 flex flex-col justify-between">
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-bold text-[#E06E43] tracking-wider uppercase block">MEMASUKI LANGKAH AKHIR</span>
                  <h3 className="text-lg font-display font-bold text-[#3F322F]">Ringkasan Pilihan</h3>
                </div>

                <div className="p-4.5 bg-white border border-[#EADCC9]/40 rounded-xl space-y-4">
                  <div>
                    <span className="text-[9px] font-bold text-[#937F73] block uppercase tracking-wider">PROGRAM TERPILIH</span>
                    <span className="text-xs font-bold text-[#3F322F] block leading-snug mt-0.5">{currentPkg.name}</span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-[#937F73] block uppercase tracking-wider">METODE LAYANAN</span>
                    <span className="text-xs font-bold text-[#3F322F] block mt-0.5">
                      {isHomecare && currentPkg.category !== "webinar" ? `Panggilan Ke Rumah (Homecare - ${distanceKm} km)` : currentPkg.category === "webinar" ? "Online Kelas (Webinar)" : "Hadir di Klinik Gayatri"}
                    </span>
                  </div>

                  <hr className="border-[#EADCC9]/45 border-dashed" />

                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[#7A6A65]">ESTIMASI TOTAL BIAYA:</span>
                    <span className="text-sm text-[#E06E43] bg-[#FFF2EB] px-2.5 py-1 rounded-full">{formatIDR(estimateData?.total || currentPkg.price)}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-xl flex items-start gap-2 text-[10px] text-sky-800 leading-snug">
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>Pelunasan dilakukan secara langsung (Tunai/M-Banking) setelah kunjungan atau kelas selesai dilaksanakan. 100% transparan tanpa deposit di awal.</span>
                </div>
              </div>

              <div className="hidden md:block pt-6 border-t border-[#EADCC9]/50 mt-6 text-[10px] text-[#937F73] leading-relaxed">
                Pemesanan Mama diproses sepenuhnya melalui jalur transparan. Tim administrasi Gayatri akan memverifikasi lewat nomor WhatsApp yang dicantumkan.
              </div>
            </div>

            {/* Right: Booking Form input or Success confirmed layout */}
            <div className="md:col-span-7 p-5 sm:p-6 md:p-8">
              {bookedReceipt ? (
                /* Success Confirmed Receipt screen */
                <div className="space-y-6 text-center animate-fadeIn py-4">
                  <div className="w-14 h-14 bg-[#D1E1CE] text-[#4D6B4E] border border-[#CCDDC8] flex items-center justify-center rounded-full mx-auto text-xl font-black">
                    ✓
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-lg font-display font-bold text-[#3F322F]">Pemesanan Berhasil Terkirim!</h3>
                    <p className="text-[10px] text-[#937F73]">Kode Reservasi Utama: <span className="font-bold text-[#3F322F]">{bookedReceipt.id}</span></p>
                  </div>

                  <div className="bg-[#FAF8F5] border border-[#EADCC9]/55 text-left p-5 rounded-2xl text-[11px] text-[#5C453C] leading-relaxed space-y-3 shadow-inner">
                    <p><span className="text-[#937F73] font-bold block uppercase text-[9px] tracking-wider">MAMA PENDAFTAR:</span> <span className="font-bold text-[#3F322F]">{bookedReceipt.clientName}</span> ({bookedReceipt.phone})</p>
                    <p><span className="text-[#937F73] font-bold block uppercase text-[9px] tracking-wider">NAMA LAYANAN:</span> <span className="font-bold text-[#3F322F]">{bookedReceipt.serviceName}</span></p>
                    <p><span className="text-[#937F73] font-bold block uppercase text-[9px] tracking-wider">JADWAL PERTEMUAN:</span> <span className="font-bold text-[#3F322F]">{bookedReceipt.date}</span> jam <span className="font-bold text-[#3F322F]">{bookedReceipt.time} WIB</span></p>
                    <p><span className="text-[#937F73] font-bold block uppercase text-[9px] tracking-wider">METODE KUNJUNGAN:</span> <span className="font-bold text-[#3F322F]">{bookedReceipt.isHomecare ? `Homecare (${bookedReceipt.distanceKm} km)` : "Hadir di Klinik"}</span></p>
                    
                    <div className="border-t border-dashed border-[#EADCC9] pt-2.5 flex justify-between font-bold text-xs text-[#3F322F]">
                      <span>TARIF KESELURUHAN (COD):</span>
                      <span className="text-sm text-[#E06E43] font-black">{formatIDR(bookedReceipt.total)}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-[#937F73] leading-relaxed max-w-md mx-auto">
                    *Admin Gayatri akan menghubungi Mama WhatsApp maksimal 1x24 jam untuk mengonfirmasi penugasan Bidan / Konselor Laktasi yang akan berkunjung. Terima kasih ya Ma!
                  </p>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setBookedReceipt(null);
                        setMamaName("");
                        setMamaPhone("");
                        setBookingDate("");
                        setStep("list");
                      }}
                      className="w-full py-3 bg-[#3F322F] hover:bg-[#F2A07C] text-white font-bold text-xs rounded-full cursor-pointer transition shadow-md"
                    >
                      Kembali ke Daftar Layanan Utama
                    </button>
                  </div>
                </div>
              ) : (
                /* Interactive Form fields */
                <form onSubmit={handleBookingSubmit} className="space-y-5">
                  <div>
                    <span className="text-[10px] font-bold text-[#E06E43] bg-[#FFF2EB] px-3.5 py-1 rounded-full inline-block uppercase tracking-widest text-center">
                      Formulir Reservasi
                    </span>
                    <h3 className="text-base font-display font-bold text-[#3F322F] mt-1">Data Kontak & Pertemuan</h3>
                  </div>

                  {warningMsg && (
                    <div className="p-3.5 bg-[#FFFBFA] border border-[#FFD9D4] rounded-xl text-xs text-red-750 flex items-start gap-2 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-[11px]">{warningMsg}</span>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-[#7A6A65] uppercase block mb-1">Nama Lengkap Mama</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-2.5 w-4 h-4 text-[#937F73]/70" />
                        <input
                          type="text"
                          value={mamaName}
                          onChange={(e) => setMamaName(e.target.value)}
                          placeholder="Contoh: Rania Kirana"
                          className="w-full pl-9 pr-4 py-2 text-xs border border-[#EADCC9]/70 focus:border-[#F2A07C] rounded-full focus:outline-none bg-[#FFFDFB] text-[#3F322F]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#7A6A65] uppercase block mb-1">Nomor WhatsApp Aktif</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs text-[#3F322F]/60 font-black font-sans">+62</span>
                        <input
                          type="tel"
                          value={mamaPhone}
                          onChange={(e) => setMamaPhone(e.target.value)}
                          placeholder="812345678"
                          className="w-full pl-12 pr-4 py-2 text-xs border border-[#EADCC9]/70 focus:border-[#F2A07C] rounded-full focus:outline-none bg-[#FFFDFB] text-[#3F322F]"
                          required
                        />
                      </div>
                      <span className="text-[9px] text-[#937F73] block mt-1 pl-2 font-mono">Contoh: 812xxxxxx (tanpa angka 0 di depan)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-[#7A6A65] uppercase block mb-1">Tanggal Kunjungan</label>
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-[#EADCC9]/70 focus:border-[#F2A07C] rounded-full focus:outline-none bg-[#FFFDFB] text-[#3F322F] cursor-pointer"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#7A6A65] uppercase block mb-1">Pilihan Waktu / Sesi</label>
                        <select
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-[#EADCC9]/70 focus:border-[#F2A07C] rounded-full focus:outline-none bg-[#FFFDFB] text-[#3F322F] cursor-pointer"
                        >
                          <option value="09:00">09:00 WIB (Pagi)</option>
                          <option value="11:00">11:00 WIB (Siang)</option>
                          <option value="13:00">13:00 WIB (Siang)</option>
                          <option value="15:00">15:00 WIB (Sore)</option>
                          <option value="18:30">18:30 WIB (Malam)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <button
                      type="submit"
                      className="w-full bg-[#3F322F] hover:bg-[#F2A07C] text-white py-3.5 rounded-full font-bold text-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <ClipboardCheck className="w-4 h-4" /> Konfirmasi Reservasi Laktasi
                    </button>
                    <button
                      type="button"
                      onClick={handleBackToDetail}
                      className="w-full text-center py-2 text-[11px] text-[#937F73] hover:text-[#3F322F] transition font-bold"
                    >
                      Batal & Kembali ke Detail
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
